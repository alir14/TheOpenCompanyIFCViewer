import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three';
import * as BUI from '@thatopen/ui';
import * as WEBIFC from 'web-ifc';
import * as OBC from '@thatopen/components';
import * as FRAGS from "@thatopen/fragments";

const ExampleHiderComponent = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [spatialStructures, setSpatialStructures] = useState<Record<string, boolean>>({});
    const [categories, setCategories] = useState<Record<string, boolean>>({});
    const [hider, setHider] = useState<OBC.Hider>();
    const [model, setModel] = useState<FRAGS.FragmentsGroup>();
    const [classifier, setClassifier] = useState<OBC.Classifier>();
    const [fragMgr, setFragmentsManager] = useState<OBC.FragmentsManager>();
    const [indx, setIndexer] = useState<OBC.IfcRelationsIndexer>();

    const components = new OBC.Components();

    useEffect(() => {
        const container = containerRef.current;

        const world = components.get(OBC.Worlds).create<
            OBC.SimpleScene,
            OBC.SimpleCamera,
            OBC.SimpleRenderer>();

        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
        world.camera = new OBC.SimpleCamera(components);

        components.init();

        world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
        world.scene.setup();
        world.scene.three.background = null;

        const grids = components.get(OBC.Grids);
        grids.create(world);


        const ifcLoader = components.get(OBC.IfcLoader);
        const fragmentsManager = components.get(OBC.FragmentsManager);

        fragmentsManager.onFragmentsLoaded.add(async (model) => {
            if (world.scene) {
                world.scene.three.add(model);
            }
        });

        const indexer = components.get(OBC.IfcRelationsIndexer);
        fragmentsManager.onFragmentsLoaded.add(async (model) => {
            console.log("what ????")
            if (model.hasProperties) await indexer.process(model);
        });

        const fetchAndLoad = async () => {
            await ifcLoader.setup();
            const file = await fetch("https://thatopen.github.io/engine_components/resources/small.ifc");
            const buffer = await file.arrayBuffer();

            const typedArray = new Uint8Array(buffer);
            const model = await ifcLoader.load(typedArray);

            setModel(model);

            const classifierObj = components.get(OBC.Classifier);
            classifierObj.byEntity(model);

            await classifierObj.bySpatialStructure(model, {
                isolate: new Set([WEBIFC.IFCBUILDINGSTOREY])
            })

            console.log(classifierObj.list.spatialStructures);
            setSpatialStructures(
                Object.fromEntries(
                    Object.keys(classifierObj.list.spatialStructures).map(
                        (key) => [key, true]
                    )
                )
            );

            console.log(classifierObj.list.entities);
            setCategories(
                Object.fromEntries(
                    Object.keys(classifierObj.list.entities).map((key) => [key, true])
                )
            );

            setClassifier(classifierObj);
            setFragmentsManager(fragmentsManager);
            setIndexer(indexer);

            const hider = components.get(OBC.Hider);
            setHider(hider);
        }

        fetchAndLoad();
    }, [])

    const toggleVisibilitySpatial = (key: string, isVisible: boolean) => {
        const updatedMap = { ...spatialStructures };
        updatedMap[key] = isVisible;

        setSpatialStructures(updatedMap);

        if (hider) {
            console.log("key", key);

            const found = classifier.list.spatialStructures[key];

            console.log("found", found);
            if (found && found.id !== null) {
                for (const [_id, model] of fragMgr.groups) {
                    const foundIDs = indx.getEntityChildren(model, found.id);
                    const fragMap = model.getFragmentMap(foundIDs);
                    
                    console.log("fragMap", fragMap);
                    hider.set(isVisible, fragMap);
                }
            }
        }
    }

    const toggleVisibilityCategory = (key: string, isVisible: boolean) => {
        const updatedMap = { ...categories };
        updatedMap[key] = isVisible;

        setCategories(updatedMap);

        if (hider) {
            console.log("key", key)

            const found = classifier.find({ entities: [key] });
            hider.set(isVisible, found);
        }
    }

    return (
        <div>
            <div ref={containerRef} style={{ width: '100vw', height: '100vh' }}></div>
            <div style={{
                position: 'absolute',
                top: 10,
                left: 0,
                minWidth: '26%',
                maxWidth: '35%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
                border: '1px solid #ccc', // Add a border to separate from the viewer
                padding: '10px',
                boxSizing: 'border-box',
                overflow: 'auto'
            }}>
                <div className="controls">
                    <h3>Floors</h3>
                    {Object.keys(spatialStructures).map((key) => (
                        <label key={key}>
                            <input
                                type="checkbox"
                                checked={spatialStructures[key]}
                                onChange={(e) => toggleVisibilitySpatial(key, e.target.checked)}
                            />
                            {key}
                        </label>
                    ))}
                    <h3>Categories</h3>
                    {Object.keys(categories).map((key) => (
                        <label key={key}>
                            <input
                                type="checkbox"
                                checked={categories[key]}
                                onChange={(e) => toggleVisibilityCategory(key, e.target.checked)}
                            />
                            {key}
                        </label>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default ExampleHiderComponent;