const { Project, SyntaxKind } = require("ts-morph");
const fs = require("fs");
const path = require("path");

const project = new Project();
const sourceFile = project.addSourceFileAtPath("App.tsx");

const srcDir = __dirname;
const typesDir = path.join(srcDir, "types");
const constDir = path.join(srcDir, "constants");
const compDir = path.join(srcDir, "components");
const iconsDir = path.join(compDir, "icons");
const screensDir = path.join(srcDir, "screens");

[typesDir, constDir, compDir, iconsDir, screensDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

let typesContent = `export interface Screen { /* TODO */ }\n`;
let constsContent = ``;
let iconsContent = `import React from 'react';\n`;
let components = {};
let screens = {};

sourceFile.getStatements().forEach(stmt => {
    const kind = stmt.getKindName();
    const text = stmt.getText();
    if (kind === "TypeAliasDeclaration" || kind === "InterfaceDeclaration") {
        typesContent += text + "\n\n";
    } else if (kind === "VariableStatement") {
        constsContent += text + "\n\n";
    } else if (kind === "FunctionDeclaration") {
        const name = stmt.getName();
        if (name && (name.startsWith("Ico") || name.endsWith("Icon"))) {
            iconsContent += text + "\n\n";
        } else if (name && ["BanPhanTich", "CongViecCuaToi", "NhanDonList", "NhanDonThem", "DonTiepNhan"].includes(name)) {
            screens[name] = text;
        } else if (name && name !== "App") {
            components[name] = text;
        }
    }
});

fs.writeFileSync(path.join(typesDir, "index.ts"), typesContent);
fs.writeFileSync(path.join(constDir, "index.ts"), constsContent);
fs.writeFileSync(path.join(iconsDir, "index.tsx"), iconsContent);

Object.entries(components).forEach(([name, content]) => {
    fs.writeFileSync(path.join(compDir, `${name}.tsx`), `import React from 'react';\n${content}\nexport default ${name};`);
});

Object.entries(screens).forEach(([name, content]) => {
    fs.writeFileSync(path.join(screensDir, `${name}.tsx`), `import React from 'react';\n${content}\nexport default ${name};`);
});

console.log("Extraction complete!");
