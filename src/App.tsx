import React from 'react';
import ModelLoader from './example';
import ModelViewer from './example2';
import CudeModel from './example3';
import My3DComponent from './example4';
import CliperExample from './exampleClipper';
import ExampleIFCLoader from './exampleIFCLoader';
import ExampleItemSelect from './exampleItemSelect';
import ExampleValueMeasurement from './exampleValueMeasurement';
import ComponentExample from './componentExample';
import RelationTreeExample from './relationTreeExample';
import TreeViewComponent from './component/relationTree/treeViewComponent';
import ModelComponentRelations from './modelComponentRelations';
import ExampleHiderComponent from './exampleHiderComponent';
import ExampleMeasurement from './exampleMeasurement';
import OrthoPerspectiveCameraApp from './exampleCamera';
import ClassificationsTreeComponent from './classifier/classifierExample';
import IFCConsoleViewer from './elementPropertiesConsoleApp';
import ElementPropertiesComponent from './elementProperties';
import IfcJsonExporter from './IfcJsonExporter';
import CustomPractice from './customPractice';

const App: React.FC = () => {
    return (
        <div>
            {/* <ModelLoader /> */}
            {/* <ModelViewer /> */}
            {/* <CudeModel /> */}
            {/* <My3DComponent /> */}
            {/* <CliperExample /> */}
            {/* <ExampleIFCLoader /> */}
            {/* <ExampleItemSelect /> */}
            {/* <ExampleValueMeasurement /> */}
            {/* {<ModelComponentRelations />} */}
            {/* <RelationTreeExample /> */}
            {/* <ExampleHiderComponent /> */}
            {/* <ExampleMeasurement /> */}
            {/* <OrthoPerspectiveCameraApp /> */}
            {/* <ClassificationsTreeComponent /> */}
            {/* <IFCConsoleViewer /> */}
            {/* <ElementPropertiesComponent /> */}
            {/* <IfcJsonExporter /> */}
            <CustomPractice />
        </div>
    );
};

export default App;
