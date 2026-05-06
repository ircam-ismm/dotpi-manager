// cf. https://oneuptime.com/blog/post/2026-03-20-calculate-broadcast-address-ipv4-subnet-mask/view
function ipToInt(ip) {
    return ip.split('.').reduce((acc, o) => (acc << 8) | parseInt(o), 0) >>> 0;
}
function intToIp(n) {
    return [(n >>> 24) & 0xff, (n >>> 16) & 0xff,
            (n >>> 8)  & 0xff,  n         & 0xff].join('.');
}
function cidrToMask(prefix) {
    return prefix === 0 ? 0 : (~((1 << (32 - prefix)) - 1)) >>> 0;
}

export function broadcastAddress(ip, mask) {
    const ipInt   = ipToInt(ip);
    const maskInt = ipToInt(mask);
    const netInt  = (ipInt & maskInt) >>> 0;
    const bcast   = (netInt | (~maskInt >>> 0)) >>> 0;
    return intToIp(bcast);
}

export function broadcastFromCidr(cidr) {
    const [ip, prefix] = cidr.split('/');
    const mask = cidrToMask(parseInt(prefix));
    const net  = (ipToInt(ip) & mask) >>> 0;
    return intToIp((net | (~mask >>> 0)) >>> 0);
}