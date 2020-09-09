const width = window.innerWidth;
const height = window.innerHeight;

const filePath = '/static/flare-2.json';
const animationSpeed = 5;

// let data;
let color = d3.scaleSequential([8, 0], d3.interpolateMagma)

treemap = data => d3.treemap()
    .size([width, height])
    .paddingOuter(3)
    .paddingTop(19)
    .paddingInner(1)
    .round(true)
  (d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value))

      
data = d3.json(filePath).then(data => data);

// const root = treemap(data);

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

format = d3.format(",d")

function render(root) {
    
    const shadow = uuidv4();

    svg.append("filter")
        .attr("id", shadow.id)
      .append("feDropShadow")
        .attr("flood-opacity", 0.3)
        .attr("dx", 0)
        .attr("stdDeviation", 3);
  
    const node = svg.selectAll("g")
      .data(d3.group(root, d => d.height))
      .join("g")
      .attr("filter", shadow)
      .selectAll("g")
      .data(d => d[1])
      .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);
  
    node.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${format(d.value)}`);
  
    node.append("rect")
        .attr("id", d => (d.nodeUid = uuidv4()).id)
        .attr("fill", d => color(d.height))
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);
  
    node.append("clipPath")
        .attr("id", d => (d.clipUid = uuidv4()).id)
      .append("use")
        .attr("xlink:href", d => d.nodeUid.href);
  
    node.append("text")
        .attr("clip-path", d => d.clipUid)
      .selectAll("tspan")
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
      .join("tspan")
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .text(d => d);
  
    node.filter(d => d.children).selectAll("tspan")
        .attr("dx", 3)
        .attr("y", 13);
  
    node.filter(d => !d.children).selectAll("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`);
}
  
function position(group, root) {
    group.selectAll("g")
        .attr("transform", d => d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`)
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
        .duration(750)
        .call(t => group0.transition(t).remove()
        .call(position, d.parent))
        .call(t => group1.transition(t)
        .attrTween("opacity", () => d3.interpolate(0, 1))
        .call(position, d));
}
  
// When zooming out, draw the old nodes on top, and fade them out.
function zoomout(d) {
    const group0 = group.attr("pointer-events", "none");
    const group1 = group = svg.insert("g", "*").call(render, d.parent);

    x.domain([d.parent.x0, d.parent.x1]);
    y.domain([d.parent.y0, d.parent.y1]);

    svg.transition()
        .duration(750)
        .call(t => group0.transition(t).remove()
        .attrTween("opacity", () => d3.interpolate(1, 0))
        .call(position, d))
        .call(t => group1.transition(t)
        .call(position, d.parent));
}
  
(async () => {
    data = await d3.json(filePath).then(data => data);

    render(treemap(data));
    
    // d3.select('button').on('click', () => render(data));
})();