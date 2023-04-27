
export const serialize = (obj) => {
    const arr = [];
    for (let k in obj) {
        arr.push(`${k}:${obj[k]}`);
    }
    return arr.join(',');
};

export const unserialize = (str) => {
    const o = {};
    str.split(',').forEach(f => {
        const [k, v] = f.split(':');
        o[k] = !isNaN(v) ? Number(v) : v;
    });
    return o;
};
