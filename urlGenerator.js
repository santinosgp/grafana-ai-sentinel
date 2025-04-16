function expandHostPattern(pattern, variables) {
    const rangeRegex = /\[(\d+):(\d+)\]/;
    const match = pattern.match(rangeRegex);
  
    let hosts = [];
  
    if (match) {
      const [fullMatch, start, end] = match;
      const prefix = pattern.slice(0, match.index);
      const suffix = pattern.slice(match.index + fullMatch.length);
  
      for (let i = parseInt(start); i <= parseInt(end); i++) {
        let host = `${prefix}${i}${suffix}`;
        Object.entries(variables).forEach(([key, value]) => {
          host = host.replace(new RegExp(`{${key}}`, 'g'), value);
        });
        hosts.push(host);
      }
    } else {
      let host = pattern;
      Object.entries(variables).forEach(([key, value]) => {
        host = host.replace(new RegExp(`{${key}}`, 'g'), value);
      });
      hosts.push(host);
    }
  
    return hosts;
  }
  
  function generateUrlsFromConfig(config) {
    const urls = [];
  
    for (const dashboard of config.dashboards) {
      const { name, description, env, country, baseUrl, hosts } = dashboard;
      const variables = { env, country };
  
      for (const hostPattern of hosts) {
        const expandedHosts = expandHostPattern(hostPattern, variables);
  
        for (const host of expandedHosts) {
          const finalVars = { ...variables, host };
          let fullUrl = baseUrl;
  
          Object.entries(finalVars).forEach(([key, value]) => {
            fullUrl = fullUrl.replace(new RegExp(`{${key}}`, 'g'), value);
          });
  
          urls.push({
            dashboardName: name,
            description,
            env,
            country,
            host,
            url: fullUrl
          });
        }
      }
    }
  
    return urls;
  }
  
  module.exports = {
    generateUrlsFromConfig
  };
  