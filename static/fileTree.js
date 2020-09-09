
const getFiles = folder => {
    if (!fs.existsSync(folder)) {
        return null;
    }

    const projectTree = {
        name: folder,
        children: []
    };

    const isDirectory = fs.statSync(folder).isDirectory();

    if (isDirectory) {
        const files = fs.readdirSync(folder);

        files.forEach(file => {
            const isSubDirectory = fs.statSync(`${folder}/${file}`).isDirectory();

            if (isSubDirectory) {
                const child = getFiles(`${folder}/${file}`);

                child.name = file;

                projectTree.children.push(child);
            } else {
                projectTree.children.push({
                    name: file,
                    value: fs.statSync(`${folder}/${file}`).size
                });
            }
        });
    } else {
        projectTree.children.push({
            name: folder,
            value: fs.statSync(folder).size 
        });
    }

    return projectTree;
};