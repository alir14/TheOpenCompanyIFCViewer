import React, { useEffect, useRef } from 'react'
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

const ExampleValueMeasurement = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const components = new OBC.Components();
        const worlds = components.get(OBC.Worlds);
        const world = worlds.create<
            OBC.SimpleScene,
            OBC.SimpleCamera,
            OBC.SimpleRenderer
        >();
        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, mountRef.current);
        world.camera = new OBC.SimpleCamera(components);

        components.init();

        world.camera.controls.setLookAt(5, 5, 5, 0, 0, 0);

        world.scene.setup();

        const grids = components.get(OBC.Grids);
        grids.create(world);

        const loadModel = async (world: any) => {
            const fragments = new OBC.FragmentsManager(components);
            const file = await fetch(
                "https://thatopen.github.io/engine_components/resources/small.frag",
            );
            const data = await file.arrayBuffer();
            const buffer = new Uint8Array(data);
            const model = fragments.load(buffer);
            world.scene.three.add(model);
        }

        loadModel(world);


        const dimensions = components.get(OBCF.VolumeMeasurement);
        dimensions.world = world;
        dimensions.enabled = true;

        const highlighter = components.get(OBCF.Highlighter);
        highlighter.setup({ world });

        highlighter.events.select.onHighlight.add((event) => {
            console.log("event", event)
            const volume = dimensions.getVolumeFromFragments(event);
            console.log(volume);
        });

        highlighter.events.select.onClear.add(() => {
            dimensions.clear();
        });

        return () => {
            world.renderer.dispose();
            world.scene.dispose();
            world.camera.dispose();
            components.dispose();
        };
    }, [])

    return <div id="container" ref={mountRef} style={{ width: '100%', height: '100vh' }} />;

}

export default ExampleValueMeasurement;
