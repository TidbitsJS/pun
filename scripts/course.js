import path from 'path'
import fs from 'fs/promises'
import matter from 'gray-matter'

import { getContentPath } from './content.js';

export async function getAllCourses(packageNames) {
    const allCourseInfo = [];

    async function processCourse(packageName) {
        const contentPath = await getContentPath(packageName);

        if (contentPath) {
            const readmePath = path.join(contentPath, 'README.md');

            try {
                const readmeContent = await fs.readFile(readmePath, 'utf8');
                const readmeData = matter(readmeContent);

                const courseInfo = {
                    packageName: packageName,
                    title: readmeData.data.title,
                    abstract: readmeData.data.abstract,
                    lectures: parseInt(readmeData.data.lectures, 10) || 0,
                    duration: parseInt(readmeData.data.duration, 10) || 0,
                };

                allCourseInfo.push(courseInfo);
            } catch (error) {
                console.error(`Error reading README for ${packageName}: ${error}`);
            }
        }
    }

    // Process each package name
    for (const packageName of packageNames) {
        await processCourse(packageName);
    }

    return allCourseInfo;
}

export async function getSingleCourse(packageName) {
    const contentPath = await getContentPath(packageName);

    if (contentPath) {
        const readmePath = path.join(contentPath, 'README.md');

        try {
            const readmeContent = await fs.readFile(readmePath, 'utf8');
            const readmeData = matter(readmeContent);

            const courseInfo = {
                packageName: packageName,
                title: readmeData.data.title,
                abstract: readmeData.data.abstract,
                lectures: parseInt(readmeData.data.lectures, 10) || 0,
                duration: parseInt(readmeData.data.duration, 10) || 0,
            };

            return courseInfo;
        } catch (error) {
            console.error(`Error reading README for ${packageName}: ${error}`);
        }
    }

    return null; // Return null if the course package is not found
}