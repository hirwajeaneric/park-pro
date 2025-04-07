/* eslint-disable @typescript-eslint/no-unused-vars */
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUpload: f({
    pdf: { maxFileSize: "2MB" },
    "application/msword": { maxFileSize: "2MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "2MB" },
  })
    .middleware(({ req }) => {
      // Add any auth logic here
      return {};
    })
    .onUploadComplete(({ file }) => {
      console.log("Upload complete", file);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;