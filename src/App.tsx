import React from 'react';
import ModelLoader from './example';
import ModelViewer from './example2';

const App: React.FC = () => {
    return (
        <div>
            Hello from React and TypeScript!
            {/* <ModelLoader /> */}
            <ModelViewer />

        </div>
    );
};

export default App;
