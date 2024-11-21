export default function checkResponse(r) {
    const sucesss = r.status === 200;
    if (!sucesss) {
        console.error(r.body, r.request.url);
    }
    return sucesss;
}