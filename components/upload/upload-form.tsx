'use client';

import { UploadFormInput } from '@/components/upload/upload-form-input';
import{z} from 'zod';
import { useUploadThing } from '@/utils/uploadthing';
import { generatePdfSummary, storePdfSummaryAction } from '@/actions/upload-actions';
import { useRef, useState } from 'react';

const Schema=z.object({
    file:z
    .instanceof(File, {message:'Invalid file'})
    .refine(
        (file)=>file.size<=20*1024*1024,
         'File size must be less than 20MB'
        )
        .refine(
            (file)=>file.type.startsWith('application/pdf'),
            'File must be a PDF'
        ),
    });
export default function UploadForm() {
    const formRef=useRef<HTMLFormElement>(null);
    const [isLoading,setIsLoading]=useState(false);
    const {startUpload,routeConfig}=useUploadThing
    ('pdfUploader',{
        onClientUploadComplete:() =>{
            console.log('uploaded successfully!');
        },
        onUploadError:(err)=>{
            console.error('upload error:', err);
        },
        onUploadBegin:()=>{
            console.log('upload has begun');
        },
    });
    const handleSubmit=async(e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();

        try{
            setIsLoading(true);
            
    
        const formData=new FormData(e.currentTarget);
        const file=formData.get('file') as File;

        //validation the fields
        const validatedFields=Schema.safeParse({file});

        console.log(validatedFields);

        if(!validatedFields.success){
        console.log(
                 validatedFields.error.flatten().fieldErrors.file?.[0] ?? 'Invalid file',
        
         );
          setIsLoading(false);
            return;
        }
        
        const resp=await startUpload([file]);
        if(!resp){
            setIsLoading(false);
             return;
        }
        //schema with zod
        //upload the file to uploadthing
        //parse the pdf using lang chain
        const result=await generatePdfSummary([resp[0]]);
        const{ data=null, message=null }= result || {};
        if(data){
            let storeResult:any;
            
            if(data.summary){
                storeResult=await storePdfSummaryAction({
                    summary:data.summary,
                    fileUrl:resp[0].serverData.file.url,
                    title:data.title,
                    fileName:file.name,
                });
                formRef.current?.reset();
            }
        //save the summary to the database
        //redirect to the [id] summary page
    }
    }catch(error){
        setIsLoading(false);
        console.error('Error occured',error);
        formRef.current?.reset();
    }
    };
    return (
        <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto"> 
               <UploadFormInput 
               isLoading={isLoading}
               ref={formRef} 
               onSubmit={handleSubmit} 
               />
        </div>
    );
}
