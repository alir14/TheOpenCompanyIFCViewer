import React, { useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";

interface LoadIfcButtonProps {
    label?: string;
    ifcLoader: OBC.IfcLoader;
    handleOnModelLoaded: (model: FRAGS.FragmentsGroup) => void;
}

const LoadIfcButton: React.FC<LoadIfcButtonProps> = (
    {
        label = "Load IFC",
        ifcLoader,
        handleOnModelLoaded
    }
) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async () => {
        setError(null); // Clear previous errors
        const fileInput = fileInputRef.current;

        if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

        const file = fileInput.files[0];
        const fileName = file.name.replace(".ifc", "");
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);

        setIsLoading(true);
        try {
            const model = await ifcLoader.load(data, true, fileName);
            model.name = file.name || "example";
            handleOnModelLoaded(model);
            console.log(`Successfully loaded: ${fileName}`);
        } catch (error) {
            console.error("Error loading IFC file:", error);
            setError("Failed to load IFC file. Please try again.");
        } finally {
            setIsLoading(false);
            fileInput.value = ""; // Reset file input
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="load-ifc-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
                onClick={triggerFileInput}
                className="load-ifc-button"
                style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "1rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginBottom: "1rem",
                    transition: "background-color 0.3s",
                }}
                disabled={isLoading}
            >
                {isLoading ? "Loading..." : label}
            </button>
            <input
                type="file"
                accept=".ifc"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
            {isLoading && <div style={{ color: "#007bff" }}>Please wait, loading your IFC file...</div>}
            {error && <div style={{ color: "red", marginTop: "1rem" }}>{error}</div>}
        </div>
    );
};

export default LoadIfcButton;
