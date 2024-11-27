import React, { useEffect } from 'react';
import { Components, IfcLoader } from '@thatopen/components';

const ModelLoader = () => {
    useEffect(() => {
        const components = new Components();  // Example of gathering necessary dependencies
        const loader = new IfcLoader(components);  // Initialize with the required argument

        const loadModel = async () => {
            const file = await fetch(
                "https://thatopen.github.io/engine_components/resources/small.ifc",
            );
            const data = await file.arrayBuffer();
            const buffer = new Uint8Array(data);
            await loader.setup();
            const model = await loader.load(buffer);
            console.log(model);
        };

        loadModel();
    }, []);

    return <div>Model is being loaded...</div>;
};

export default ModelLoader;
