'use server';

export async function PUT(r:Request, props : { params: Promise<{id:string}>}) {
    const { id } = (await props.params);
    console.log(`PUT happened with ${id}`);
    
    return new Response('Unimplemented',
        { 
            status: 501,
            headers: { "Content-Type": "text/plain"}
        });
}