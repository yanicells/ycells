"""Render the procedural specimen export with Blender in background mode.

The input uses Three.js coordinates and column-major matrixWorld values. The
numeric coordinates are kept unchanged for this static view: the camera is at
the Three position and its local Y axis is explicitly used as image-up. Only
the matrix array is transposed into Blender's Matrix constructor. The camera
distance is exported from the same bounding-sphere fit as scene.ts.

Example:
  blender --background --python scripts/render-specimen.py -- \
    --input /tmp/ycells-specimen.json --output public/specimen.webp \
    --preview /tmp/ycells-specimen-preview.png --size 1000
"""

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


def arguments():
    # Blender leaves its own flags before the `--` separator.
    raw = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--preview", required=True)
    parser.add_argument("--size", type=int, default=1000)
    return parser.parse_args(raw)


def three_matrix(values):
    # Three Matrix4.toArray() is column-major: [m11,m21,...,m44].
    return Matrix(
        (
            (values[0], values[4], values[8], values[12]),
            (values[1], values[5], values[9], values[13]),
            (values[2], values[6], values[10], values[14]),
            (values[3], values[7], values[11], values[15]),
        )
    )


def material_from_data(data):
    material = bpy.data.materials.new(data["name"] or data["type"])
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    shader.inputs["Base Color"].default_value = (*data["color"], 1.0)
    shader.inputs["Roughness"].default_value = max(0.02, min(1.0, data["roughness"]))
    shader.inputs["Metallic"].default_value = max(0.0, min(1.0, data["metalness"]))
    if "Coat Weight" in shader.inputs:
        shader.inputs["Coat Weight"].default_value = data["clearcoat"]
        shader.inputs["Coat Roughness"].default_value = data["clearcoatRoughness"]
        shader.inputs["IOR"].default_value = data["ior"]
    elif "Clearcoat" in shader.inputs:
        shader.inputs["Clearcoat"].default_value = data["clearcoat"]
        shader.inputs["Clearcoat Roughness"].default_value = data["clearcoatRoughness"]
        shader.inputs["IOR"].default_value = data["ior"]

    if data["vertexColors"]:
        colors = nodes.new("ShaderNodeVertexColor")
        colors.layer_name = "Color"
        links.new(colors.outputs["Color"], shader.inputs["Base Color"])

    # The browser uses a small procedural grain map as bump. A matching
    # procedural noise keeps the Blender fallback tactile without asset files.
    bump_scale = float(data.get("bumpScale", 0.0))
    if bump_scale > 0:
        noise = nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 38.0
        noise.inputs["Detail"].default_value = 3.0
        noise.inputs["Roughness"].default_value = 0.72
        bump = nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = min(0.42, bump_scale * 10.0)
        bump.inputs["Distance"].default_value = max(0.001, bump_scale)
        links.new(noise.outputs["Fac"], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], shader.inputs["Normal"])

    links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    return material


def create_mesh_mesh(data):
    attrs = data["attributes"]
    positions = attrs["position"]["array"]
    item_size = attrs["position"]["itemSize"]
    vertices = [tuple(positions[i : i + item_size]) for i in range(0, len(positions), item_size)]
    indices = data.get("index")
    if indices:
        faces = [tuple(indices[i : i + 3]) for i in range(0, len(indices), 3)]
    else:
        faces = [tuple(range(i, i + 3)) for i in range(0, len(vertices), 3)]

    mesh = bpy.data.meshes.new(data["name"])
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    matrix = three_matrix(data["matrixWorld"])
    for vertex in mesh.vertices:
        vertex.co = matrix @ vertex.co

    # Preserve Three's smooth indexed-mesh normals after baking matrixWorld.
    normal_attr = attrs.get("normal")
    if normal_attr:
        values = normal_attr["array"]
        size = normal_attr["itemSize"]
        normal_matrix = matrix.to_3x3().inverted().transposed()
        normals = []
        for offset in range(0, len(values), size):
            normal = normal_matrix @ Vector(values[offset : offset + 3])
            normals.append(normal.normalized())
        try:
            mesh.normals_split_custom_set_from_vertices(normals)
        except RuntimeError:
            # Older Blender builds can reject custom normals on freshly created
            # meshes; their calculated normals are still a sound fallback.
            pass

    # Three vertex colors are linear RGB. A CORNER color layer handles both
    # indexed and non-indexed geometry without losing per-face seams.
    color_attr = attrs.get("color")
    if color_attr:
        layer = mesh.color_attributes.new(name="Color", type="FLOAT_COLOR", domain="CORNER")
        colors = color_attr["array"]
        color_size = color_attr["itemSize"]
        for polygon in mesh.polygons:
            for loop_index in polygon.loop_indices:
                source_index = mesh.loops[loop_index].vertex_index
                offset = source_index * color_size
                value = colors[offset : offset + color_size]
                if len(value) >= 3:
                    layer.data[loop_index].color = (*value[:3], 1.0)

    uv_attr = attrs.get("uv")
    if uv_attr:
        uv_layer = mesh.uv_layers.new(name="UVMap")
        uvs = uv_attr["array"]
        uv_size = uv_attr["itemSize"]
        for polygon in mesh.polygons:
            for loop_index in polygon.loop_indices:
                source_index = mesh.loops[loop_index].vertex_index
                offset = source_index * uv_size
                value = uvs[offset : offset + uv_size]
                if len(value) >= 2:
                    uv_layer.data[loop_index].uv = (value[0], value[1])

    object_ = bpy.data.objects.new(data["name"], mesh)
    bpy.context.collection.objects.link(object_)
    object_.data.materials.append(material_from_data(data["material"]))
    flat = data["material"].get("flatShading", False)
    for polygon in mesh.polygons:
        polygon.use_smooth = not flat
    object_.visible_shadow = True
    return object_


def area_light(name, location, energy, color, size):
    light_data = bpy.data.lights.new(name, type="AREA")
    light_data.energy = energy
    light_data.color = color
    light_data.shape = "DISK"
    light_data.size = size
    light = bpy.data.objects.new(name, light_data)
    bpy.context.collection.objects.link(light)
    light.location = location
    direction = Vector((0, 0, 0)) - light.location
    light.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return light


def configure_scene(size):
    scene = bpy.context.scene
    # Blender 5.2 may expose the Eevee engine under the legacy enum name
    # (BLENDER_EEVEE) in portable/Homebrew builds.
    engine_ids = {item.identifier for item in scene.bl_rna.properties["render"].fixed_type.properties["engine"].enum_items}
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engine_ids else "BLENDER_EEVEE"
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.resolution_percentage = 100
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    world = bpy.data.worlds.new("Pure Black World")
    scene.world = world
    world.color = (0, 0, 0)
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0, 0, 0, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.0
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = 0.0
    scene.render.image_settings.color_mode = "RGBA"
    return scene


def create_camera(camera_data):
    camera_data_block = bpy.data.cameras.new("Specimen Camera")
    camera_data_block.lens = 50
    camera_data_block.sensor_width = 36
    camera_data_block.angle = math.radians(camera_data["fov"])
    camera = bpy.data.objects.new("Specimen Camera", camera_data_block)
    bpy.context.collection.objects.link(camera)
    camera.location = camera_data["position"]
    target = Vector(camera_data["target"])
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = camera
    return camera


def render(args, payload):
    # Start with an empty scene, preserving no UI state in background mode.
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = configure_scene(args.size)
    for mesh in payload["meshes"]:
        create_mesh_mesh(mesh)

    # Softbox arrangement mirrors scene.ts: warm key, cool fill, warm rim.
    area_light("Key", (-3.5, 4.5, 5.0), 720.0, (1.0, 0.90, 0.82), 4.2)
    area_light("Fill", (3.5, 0.8, 3.0), 190.0, (0.70, 0.80, 1.0), 5.0)
    area_light("Rim", (1.0, 3.0, -4.0), 430.0, (1.0, 0.66, 0.58), 3.0)
    camera = create_camera(payload["camera"])

    # The poster intentionally has no floor: the scene.ts fallback is a pure
    # black canvas. Area lights still provide soft self-shadowing on the rock.
    for object_ in bpy.context.scene.objects:
        if object_.type == "MESH":
            object_.visible_shadow = True
            object_.visible_diffuse = True
            object_.visible_glossy = True
    preview = Path(args.preview).resolve()
    preview.parent.mkdir(parents=True, exist_ok=True)
    scene.render.filepath = str(preview)
    bpy.ops.render.render(write_still=True)

    # Blender 5 supports WebP output directly. Keep the preview as PNG for
    # quick inspection while writing the requested poster to public/.
    output = Path(args.output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.quality = 90
    scene.render.filepath = str(output)
    bpy.data.images["Render Result"].save_render(str(output), scene=scene)
    return output, preview, camera


def main():
    args = arguments()
    with open(args.input, "r", encoding="utf-8") as stream:
        payload = json.load(stream)
    output, preview, camera = render(args, payload)
    print(
        json.dumps(
            {
                "output": str(output),
                "preview": str(preview),
                "size": [args.size, args.size],
                "camera": [round(value, 4) for value in camera.location],
            }
        )
    )


if __name__ == "__main__":
    main()
