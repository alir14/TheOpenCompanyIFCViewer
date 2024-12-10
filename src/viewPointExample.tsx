import React, { useEffect, useRef } from 'react'
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as THREE from "three";
import * as WEBIFC from "web-ifc";

const ViewPointExample = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;
        BUI.Manager.init();

        const viewport = document.createElement("bim-viewport");

        //setup world

        const components = new OBC.Components();

        const worlds = components.get(OBC.Worlds);
        const world = worlds.create<
            OBC.SimpleScene,
            OBC.SimpleCamera,
            OBC.SimpleRenderer
        >();

        world.scene = new OBC.SimpleScene(components);
        world.scene.setup();

        world.renderer = new OBC.SimpleRenderer(components, viewport);
        world.camera = new OBC.SimpleCamera(components);

        const viewerGrids = components.get(OBC.Grids);
        viewerGrids.create(world);

        components.init();

        const setupCamera = async () => {
            await world.camera.controls.setLookAt(12, 6, 8, 0, 2, -2);
        }

        setupCamera();
        //world: any, components: any
        const loadingIFC = async () => {
            const ifcLoader = components.get(OBC.IfcLoader);
            await ifcLoader.setup();
            const file = await fetch(
                "https://thatopen.github.io/engine_components/resources/small.ifc",
            );
            const data = await file.arrayBuffer();
            const buffer = new Uint8Array(data);
            const model = await ifcLoader.load(buffer);
            world.scene.three.add(model);

            return model;
        }
        //world, components
        let model: any;
        loadingIFC().then((result) => {
            model = result
        }).catch((error) => {
            console.log("Error", error)
        });

        const viewpoints = components.get(OBC.Viewpoints);
        const viewpoint = viewpoints.create(world, { title: "My Viewpoint" }); // You can set an optional title for UI purposes

        const updateViewpointCamera = async () => {
            console.log("Position before updating", viewpoint.position);
            viewpoint.updateCamera();
            console.log("Position after updating", viewpoint.position);
        };

        const setWorldCamera = async () => {
            const initialPosition = new THREE.Vector3();
            world.camera.controls.getPosition(initialPosition);
            console.log("Camera position before updating", initialPosition);
            await viewpoint.go(world);
            const finalPosition = new THREE.Vector3();
            world.camera.controls.getPosition(finalPosition);
            console.log("Camera position before updating", finalPosition);
        };


        viewpoint.selectionComponents.add(
            "2idC0G3ezCdhA9WVjWe",
            "2idC0G3ezCdhA9WVjWe$Pp",
        );

        const transferSelection = async () => {
            const walls = await model.getAllPropertiesOfType(WEBIFC.IFCWALLSTANDARDCASE);
            if (walls) {
                const expressIDs = Object.values(walls).map((attrs: any) => attrs.expressID);
                const fragmentIdMap = model.getFragmentMap(expressIDs);
                viewpoint.addComponentsFromMap(fragmentIdMap);
            }
        }

        transferSelection();

        const reportComponents = () => {
            const selectionGuids = viewpoint.selectionComponents;
            const selectionFragmentIdMap = viewpoint.selection;
            console.log(selectionGuids, selectionFragmentIdMap);
        };

        const bcfTopics = components.get(OBC.BCFTopics);
        const topic = bcfTopics.create();
        topic.viewpoints.add(viewpoint.guid);

        const reportTopicViewpoints = () => {
            const topicViewpoints = [...topic.viewpoints].map((guid) =>
                viewpoints.list.get(guid),
            );
            console.log(topicViewpoints);
        };

        return () => {
        };
    }, [])

    return <div id="container" ref={mountRef} style={{ width: '100%', height: '100vh' }} />;

}

export default ViewPointExample;
