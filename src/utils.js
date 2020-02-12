export const objByString = (obj, path) => {
    let properties = Array.isArray(path) ? path : path.split('.');
    return properties.reduce((prev, curr) => prev && prev[curr], obj);
};
