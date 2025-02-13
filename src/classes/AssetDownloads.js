class AssetDownloads {
    static only(types) {
        return types.map(type => ({
            icon: "fa-download", // Default icon
            label: `Download ${type}`, // Label for the file type
        }));
    }
}
export default AssetDownloads;
