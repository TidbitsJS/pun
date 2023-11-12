import path from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';

// export async function getContentPath(packageName) {
//     console.log("getContentPath", packageName)

//     // Get the path to the node_modules directory
//     const nodeModulesPath = path.resolve('node_modules');

//     // Check for the package directory
//     const packagePath = path.join(nodeModulesPath, packageName);
//     try {
//         const stat = await fs.stat(packagePath);
//         if (stat.isDirectory()) {
//             // Package directory found, construct and return the content path
//             const contentPath = path.join(packagePath, 'content');
//             return contentPath;
//         }
//     } catch (error) {
//         console.error(`Package ${packageName} not found in node_modules: ${error}`);
//         return null;
//     }
// }

export async function getContentPath(packageName) {
    console.log("packageName", packageName)

    try {
        // Get the current working directory
        const currentWorkingDirectory = process.cwd();

        // Construct the package path based on the current working directory
        const packagePath = path.join(currentWorkingDirectory, 'node_modules', packageName);
        console.log("packagePath", packagePath)

        try {
            // Check if the package directory exists by attempting to access it
            // await fs.access(packagePath);

            // If the access is successful, construct and return the content path
            const contentPath = path.join(packagePath, 'content');
            console.log("contentPath", contentPath)

            return contentPath;
        } catch (error) {
            console.error(`Package ${packageName} not found in node_modules.`);
            return null;
        }
    } catch (error) {
        console.error(`Error while determining the package path: ${error}`);
        return null;
    }
}

export async function getLectureContent(packageName, moduleName, lectureName) {
    const contentPath = await getContentPath(packageName);

    if (contentPath) {
        const modulePath = path.join(contentPath, moduleName);
        const lecturePath = path.join(modulePath, `${lectureName}.mdx`);

        try {
            const lectureContent = await fs.readFile(lecturePath, 'utf8');
            const lectureData = matter(lectureContent);

            const formattedLectureInfo = {
                title: lectureData.data.title || '',
                abstract: lectureData.data.abstract || '',
                slug: lectureName,
                content: lectureData.content || '',
            };

            return formattedLectureInfo;
        } catch (error) {
            console.error(`Error reading lecture content for ${packageName}/${moduleName}/${lectureName}: ${error}`);
        }
    }

    return null; // Return null if the lecture content is not found
}

export async function generateCurriculumStructure(packageName) {
    const curriculum = [];

    async function processDirectory(directoryName, directoryPath) {
        const sectionInfo = {
            slug: directoryName,
            meta: {},
            lectures: [],
        };

        // Read the section's index.mdx file to get the metadata
        const indexPath = path.join(directoryPath, 'index.mdx');
        try {
            const indexContent = await fs.readFile(indexPath, 'utf8');
            const indexData = matter(indexContent);
            sectionInfo.meta = indexData.data;
        } catch (error) {
            console.error(`Error reading index.mdx for ${directoryName}: ${error}`);
        }

        // Read the section's mdx files to get lectures
        const lectureFiles = await fs.readdir(directoryPath, { withFileTypes: true });
        for (const lectureFile of lectureFiles) {
            if (lectureFile.isFile() && lectureFile.name !== 'index.mdx') {
                const lectureInfo = {
                    slug: lectureFile.name.replace('.mdx', ''),
                    meta: {},
                };

                const lecturePath = path.join(directoryPath, lectureFile.name);
                try {
                    const lectureContent = await fs.readFile(lecturePath, 'utf8');
                    const lectureData = matter(lectureContent);
                    lectureInfo.meta = lectureData.data;
                } catch (error) {
                    console.error(`Error reading lecture file for ${directoryName}/${lectureFile.name}: ${error}`);
                }

                sectionInfo.lectures.push(lectureInfo);
            }
        }

        curriculum.push(sectionInfo);
    }

    const contentPath = await getContentPath(packageName);
    const contentDirectories = await fs.readdir(contentPath, { withFileTypes: true });

    for (const directory of contentDirectories) {
        if (directory.isDirectory()) {
            const directoryName = directory.name;
            const directoryPath = path.join(contentPath, directoryName);
            await processDirectory(directoryName, directoryPath);
        }
    }

    return curriculum;
}
