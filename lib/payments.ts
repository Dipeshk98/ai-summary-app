import { Stripe } from "stripe";
import {getDbConnection} from './db';

export async function handleCheckoutSessionCompleted({
    session,
    stripe}:{
        session:Stripe.Checkout.Session;
        stripe:Stripe;
    }){
        console.log('Checkout session completed',session);
        const customerId=session.customer as string;
        const customer=await stripe.customers.retrieve(customerId);
        const priceId=session.line_items?.data[0]?.price?.id;

        if('email' in customer && priceId){
            const{email,name}=customer;

            await createOrUpdateUser({
                sql,
                email:email as string,
                fullName:name as string,
                customerId,
                priceId:priceId as string,
                status:'active',
            });
            await createPayment({
                sql,
                session,
                priceId:priceId as string,
                userEmail:email as string,
            });
        }
    }

    async function createOrUpdateUser({
        sql, 
        email,
        fullName,
        customerId,
        priceId,
        status,
    }:{
        sql:any;
        email:string;    
        fullName:string;
        customerId:string;
        priceId:string;
        status:string;
    }){
        try {
        const sql=await getDbConnection();
        const user=await sql`SELECT * FROM users WHERE email=${email}`
        if (user.length===0){
            await sql`INSERT INTO users (email,full_Name,customer_Id,price_Id,status) VALUES (${email},${fullName},${customerId},${priceId},${status})`;
        }
        } catch (error) {
            console.log('Error creating or updating user',error);
        }
    }

    async function createPayment({
        sql,
        session,
        priceId,
        userEmail,
    }:{
        session:Stripe.Checkout.Session;
        priceId:string;
    }){
        try {
        const {amount_total,id,customer_email,status}=session;
        await sql`INSERT INTO payments (amount,status,stripe_payment_id,price_id,user_email) VALUES (${amount_total},${status},${id},${priceId},${userEmail})`;
        } catch (error) {
            console.log('Error creating payment',error);
        }
    }