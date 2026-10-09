const { Project, SyntaxKind } = require("ts-morph");
const fs = require("fs");
const path = require("path");

const project = new Project(); 
project.addSourceFilesAtPaths("**/*.{ts,tsx}");

// First, clear App.tsx to only contain the App function
const appFile = project.getSourceFile("App.tsx");
appFile.getStatements().forEach(stmt => {
    const kind = stmt.getKindName();
    if (kind === "TypeAliasDeclaration" || kind === "InterfaceDeclaration" || kind === "VariableStatement") {
        if (!stmt.getText().includes("export default App")) {
            stmt.remove();
        }
    } else if (kind === "FunctionDeclaration") {
        if (stmt.getName() !== "App") {
            stmt.remove();
        }
    }
});
appFile.saveSync();

// Now fix missing imports for all files
project.getSourceFiles().forEach(file => {
    file.fixMissingImports();
    file.saveSync();
});

console.log("Imports fixed and App.tsx cleaned!");
