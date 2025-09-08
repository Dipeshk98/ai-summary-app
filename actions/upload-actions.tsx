'use server';
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { generateSummaryFromGemini } from "@/lib/geminiai";
import { generateSummaryFromGroq } from "@/lib/groq";
import {auth} from'@clerk/nextjs/server';
import {getDbConnection} from '@/lib/db';
import {formatFileNameAsTitle} from '@/utils/format-utils';

interface PdfSummaryType{
    userId?:string;
    fileUrl:string;
    summary:string;
    title?:string;
    fileName?:string;
}


export async function generatePdfSummary(
    uploadResponse: [
        {
            serverData: {
                userId: string;
                file: {
                    url: string;
                    name: string;
                };        
            }
        }
    ]
) {
    if(!uploadResponse) {
        return {
            success: false,
            message:' File upload failed',
            data:null,
        };
    }
    const {
        serverData:{
            userId,
            file:{url:pdfUrl,name:fileName},
        },
    } = uploadResponse[0];
     
    if (!pdfUrl) {
        return {
            success: false,
            message: 'File upload failed',
            data: null,
        };
    }

    try{
        const pdfText=await fetchAndExtractPdfText(pdfUrl);
        console.log({pdfText});
         
        let summary;
        
        // Try Groq first (free and fast)
        try {
            summary = await generateSummaryFromGroq(pdfText);
            console.log('Groq summary generated:', {summary});
        } catch (groqError) {
            console.log('Groq failed, trying OpenAI:', groqError);
            
            // Fallback to OpenAI
            try {
                summary = await generateSummaryFromOpenAI(pdfText);
                console.log('OpenAI summary generated:', {summary});
            } catch (openaiError) {
                console.log('OpenAI failed, trying Gemini:', openaiError);
                
                // Final fallback to Gemini
                try {
                    summary = await generateSummaryFromGemini(pdfText);
                    console.log('Gemini summary generated:', {summary});
                } catch (geminiError) {
                    console.error('All AI providers failed:', {groqError, openaiError, geminiError});
                    throw new Error('All AI providers failed to generate summary');
                }
            }
        }
        
        if(!summary){
            return{
                success:false,
                message:'Failed to generate summary',
                data:null
            };
        }
        const formattedFileName=formatFileNameAsTitle(fileName);
        return{
            success:true,
            message:'Summary generated successfully',
            data:{
                title:formattedFileName,
                summary,
            },
        };
    } catch (err) {
        return{
            success: false,
            message: 'File upload failed',
            data: null,
        };
    }
}

async function savePdfSummary({
    userId,
    fileUrl,
    summary,
    title,
    fileName,
}:PdfSummaryType){
    //sql inserting pdf summary
    try{
        const sql = await getDbConnection();
        await sql`INSERT INTO pdf_summaries (
  user_id,
  original_file_url,
  summary_text,
  title,
  file_name
)
VALUES (
    ${userId},
    ${fileUrl},
    ${summary},
    ${title},
    ${fileName}
)`;

    }catch (error){
        console.error('Error saving PDF summary',error);
        throw error;
    }
}

export async function storePdfSummaryAction({
    
    fileUrl,
    summary,
    title,
    fileName,
}:PdfSummaryType){
    //user is logged in and has a userId
    try{
        const {userId} = await auth();
        if(!userId){
            return{
                success:false,
                message:'User not found',
            };
        }

        await savePdfSummary({
            userId,
            fileUrl,
            summary,
            title,
            fileName,
        });

        return{
            success:true,
            message:'PDF summary saved successfully',
        };
    }catch (error){
        return{
            success:false,
            message:
            error instanceof Error ? error.message : 'Error saving PDF summary',
            data:null,
        };
    }
}
