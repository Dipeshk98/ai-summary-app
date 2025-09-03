import {UploadThingError, createUploadthing, type FileRouter} from 'uploadthing/server';
import {currentUser} from '@clerk/nextjs/server';

const f=createUploadthing();

export const ourFileRouter= {
pdfUploader:f({pdf: {maxFileSize: '32MB'}})
.middleware(async ({req})=>{
    //get user info
    const user=await currentUser();
    
    if(!user) throw new UploadThingError
    ('Unauthorized');
    return {userId: user.id};
})
.onUploadComplete(async ({metadata, file})=>{
    console.log('Upload complete for user id', metadata.userId);
    console.log('file key', file.key);

    return { 
        userId: metadata.userId,
        file: {
            url: file.ufsUrl || file.url, // Use ufsUrl if available, fallback to url
            name: file.name
        }
    };
}),
} satisfies FileRouter;

export type OurFileRouter=typeof ourFileRouter;