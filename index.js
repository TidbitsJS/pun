import { getAllCourses, getSingleCourse } from "./scripts/course.js"
import { getContentBySlug, generateCurriculumStructure } from "./scripts/content.js"

console.log("Hello from Main 'pun' package!")

export {
    getAllCourses,
    getSingleCourse,
    getContentBySlug,
    generateCurriculumStructure
}