const width = window.innerWidth;
const height = window.innerHeight;

const x = d3.scaleLinear().rangeRound([0, width]);
const y = d3.scaleLinear().rangeRound([0, height]);


const filePath = '/static/synset_hierarchy.json';
const animationSpeed = 5;

// let data;
let color = d3.scaleSequential([8, 0], d3.interpolateMagma)


function tile(node, x0, y0, x1, y1) {
  d3.treemapBinary(node, 0, 0, width, height);
  for (const child of node.children) {
    child.x0 = x0 + child.x0 / width * (x1 - x0);
    child.x1 = x0 + child.x1 / width * (x1 - x0);
    child.y0 = y0 + child.y0 / height * (y1 - y0);
    child.y1 = y0 + child.y1 / height * (y1 - y0);
  }
}

treemap = data => d3.treemap()
    .tile(tile)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))

      
data = d3.json(filePath).then(data => data);

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);

        return v.toString(16);
    });
}

const svg = d3.select('.treemap')
    .attr("viewBox", [0, 0, width, height])
    .style("font", "10px sans-serif");

format = d3.format("");
namemap = d => d.ancestors().reverse().map(d => d.data.name).join("/");

let group = svg.append("g")

function render(group, root) {
    if (root.children) {
      var data = root.children.concat(root);
      const node = group
      .selectAll("g")
      .data(data)
      .join("g");

      node.attr("cursor", "pointer")
          .on("click", (event, d) => d === root ? zoomout(root) : zoomin(d))

      node.append("title")
          .text(d => `${namemap(d)}\n${format(d.value)}`);

      node.append("rect")
          .attr("id", d => (d.leafUid = uuidv4()).id)
          .attr("fill", d => d === root ? "rgb(105, 201, 129)" : d.children ? "rgb(148, 220, 121)" : "rgb(197, 236, 113)")
          .attr("stroke", "#fff");

      node.append("clipPath")
          .attr("id", d => (d.clipUid = uuidv4()).id)
          .append("use")
          .attr("xlink:href", d => d.leafUid.href);

      node.append("text")
          .attr("clip-path", d => d.clipUid)
          .attr("font-weight", d => d === root ? "bold" : null)
          .attr("font-size", d => d === root? "20px": "14px")
          .selectAll("tspan")
          .data(d => d === root ? namemap(d).concat(" ",format(d.value)).split(/(?=[A-Z][^A-Z])/g) : d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
          .join("tspan")
          .attr("x", 3)
          .attr("y", (d, i, nodes) => i === nodes.length - 1 ? `${(i === nodes.length - 1) * 0.3 + 0.8 + i * 0.9}em`:`${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
          .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
          .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
          .text(d => d);

      // Add image to leaf
      node.filter(d => !d.children && x(d.x1)-x(d.x0) > 10 && y(d.y1)-y(d.y0) > 50)
          .append("svg:image")
          .attr('x', 5)
          .attr('y', 20)
          .attr('width', d=>x(d.x1)-x(d.x0)-10)
          .attr('height', d=>y(d.y1)-y(d.y0)-20)
          .attr("xlink:href", "/static/doggie.jpeg");
    }
    else{
      var data = [root]
      const node = group
          .selectAll("g")
          .data(data)
          .join("g");
      node.attr("cursor", "pointer")
        .on("click", (event, d) => zoomout(root))

      node.append("title")
          .text(d => `${namemap(d)}\n${format(d.value)}`);

      node.append("rect")
          .attr("id", d => (d.leafUid = uuidv4()).id)
          .attr("fill", d => d === root ? "rgb(105, 201, 129)" : d.children ? "rgb(148, 220, 121)" : "rgb(197, 236, 113)")
          .attr("stroke", "#fff");

      node.append("rect")
          .attr("id", "leaf")
          .attr("x", 0)
          .attr("y", 30)
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "rgb(197, 236, 113)");

      node.append("clipPath")
          .attr("id", d => (d.clipUid = uuidv4()).id)
          .append("use")
          .attr("xlink:href", d => d.leafUid.href);

      node.append("text")
          .attr("clip-path", d => d.clipUid)
          .attr("font-weight", d => d === root ? "bold" : null)
          .attr("font-size", d => d === root? "20px": "14px")
          .selectAll("tspan")
          .data(d => d === root ? namemap(d).concat(" ",format(d.value)).split(/(?=[A-Z][^A-Z])/g) : d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
          .join("tspan")
          .attr("x", 3)
          .attr("y", (d, i, nodes) => i === nodes.length - 1 ? `${(i === nodes.length - 1) * 0.3 + 0.8 + i * 0.9}em`:`${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
          .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
          .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
          .text(d => d);

      // Add image to leaf
      node.append("svg:image")
          .attr('x', 0)
          .attr('y', 30)
          .attr('width', x)
          .attr('height', y)
          .attr("xlink:href", "/static/doggie.jpeg")
    }

    group.call(position, root);
  }
  
  function position(group, root) {
    group.selectAll("g")
        .attr("transform", d => d === root ? `translate(${x(d.x0)},${y(d.y0)})` : `translate(${x(d.x0)},${y(d.y0)+30})`)
        .select("rect")
        .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
        .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
  }

  // When zooming in, draw the new nodes on top, and fade them in.
  function zoomin(d) {
    const group0 = group.attr("pointer-events", "none");
    const group1 = group = svg.append("g").call(render, d);

    x.domain([d.x0, d.x1]);
    y.domain([d.y0, d.y1]);

    svg.transition()
        .duration(250)
        .call(t => group0.transition(t).remove().call(position, d.parent))
        .call(t => group1.transition(t).attrTween("opacity", () => d3.interpolate(0, 1)).call(position, d));
  }

  // When zooming out, draw the old nodes on top, and fade them out.
  function zoomout(d) {
    x.domain([d.parent.x0, d.parent.x1]);
    y.domain([d.parent.y0, d.parent.y1]);
    
    const group0 = group.attr("pointer-events", "none");
    const group1 = group = svg.insert("g", "*").call(render, d.parent);

    svg.transition()
        .duration(250)
        .call(t => group0.transition(t).remove()
          .attrTween("opacity", () => d3.interpolate(1, 0))
          .call(position, d))
        .call(t => group1.transition(t)
          .call(position, d.parent));
  }
  
(async () => {
    data = await d3.json(filePath).then(data => data);
    render(group, treemap(data));
    
    // d3.select('button').on('click', () => render(data));
})();
