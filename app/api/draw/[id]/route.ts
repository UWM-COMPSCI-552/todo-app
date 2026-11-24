'use server';

export async function PUT(r:Request, props : Promise<{id:string}>) {
    const { id } = (await props);
    console.log(`PUT happened with ${id}`);
    
    return new Response('Unimplemented',
        { 
            status: 501,
            headers: { "Content-Type": "text/plain"}
        });
}