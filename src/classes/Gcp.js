class Gcp {
    constructor(text) {
      this.text = text;
    }
  
    resize(imagesRatioMap, muteWarnings = false) {
      let ratioMap = {};
      for (let k in imagesRatioMap) {
        ratioMap[k.toLowerCase()] = parseFloat(imagesRatioMap[k]);
      }
  
      const lines = this.text.split(/\r?\n/);
      let output = "";
  
      if (lines.length > 0) {
        output += lines[0] + '\n'; // Coordinate system description
        for (let i = 1; i < lines.length; i++) {
          let line = lines[i].trim();
          if (line !== "" && line[0] !== "#") {
            let parts = line.split(/\s+/);
            if (parts.length >= 6) {
              let [x, y, z, px, py, imagename, ...extracols] = parts;
              let ratio = ratioMap[imagename.toLowerCase()];
              px = parseFloat(px);
              py = parseFloat(py);
  
              if (ratio !== undefined) {
                px *= ratio;
                py *= ratio;
              } else if (!muteWarnings) {
                console.warn(`${imagename} not found in ratio map. Are you missing some images?`);
              }
  
              let extra = extracols.length > 0 ? ' ' + extracols.join(' ') : '';
              output += `${x} ${y} ${z} ${px.toFixed(8)} ${py.toFixed(8)} ${imagename}${extra}\n`;
            } else if (!muteWarnings) {
              console.warn(`Invalid GCP format at line ${i}: ${line}`);
            }
          }
        }
      }
  
      return new Gcp(output);
    }
  
    toString() {
      return this.text;
    }
  }
  
  module.exports = Gcp;
  