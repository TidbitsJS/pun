import { getAllCourses, getSingleCourse } from "./scripts/course.js"
import { getLectureContent, generateCurriculumStructure } from "./scripts/content.js"

console.log("Hello from Main 'pun' package!")

export {
    getAllCourses,
    getSingleCourse,
    getLectureContent,
    generateCurriculumStructure
}