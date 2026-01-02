
export async function publishToInstagram(
    imageUrl: string,
    caption: string,
    instagramBusinessId: string,
    accessToken: string
) {
    try {
        // 1. Create Media Container
        const createMediaUrl = `https://graph.facebook.com/v21.0/${instagramBusinessId}/media`;
        const containerResponse = await fetch(createMediaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url: imageUrl,
                caption: caption,
                access_token: accessToken,
            }),
        });

        const containerData = await containerResponse.json();

        if (containerData.error) {
            console.error('Instagram Container Error:', containerData.error);
            return { success: false, error: containerData.error.message };
        }

        const creationId = containerData.id;

        // 2. Publish Media
        const publishUrl = `https://graph.facebook.com/v21.0/${instagramBusinessId}/media_publish`;
        const publishResponse = await fetch(publishUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: accessToken,
            }),
        });

        const publishData = await publishResponse.json();

        if (publishData.error) {
            console.error('Instagram Publish Error:', publishData.error);
            return { success: false, error: publishData.error.message };
        }

        return { success: true, id: publishData.id };

    } catch (error: any) {
        return { success: false, error: error.message || 'Unknown network error' };
    }
}
