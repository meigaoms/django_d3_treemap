const width = window.innerWidth;
const height = window.innerHeight;

const filePath = '/static/synset_hierarchy.json';
const animationSpeed = 5;

let data;
let color = d3.scaleSequential([8, 0], d3.interpolateCool);

const treemap = data => d3.treemap()
                          .size([width, height])
                          .paddingOuter(5)
                          .paddingTop(20)
                          .paddingInner(1)
                          .round(true)
                          (d3.hierarchy(data)
                          .sum(d => d.value)
                          .sort((a, b) => b.value - a.value));

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);

        return v.toString(16);
    });
}


const zoomIn = (path, root) => {
    const name = path.split('.').splice(-1)[0];
    const normalizedPath = path.split('.')
                               .slice(1)
                               .join('.');

    const treemapData = normalizedPath.split('.').reduce((obj, path) => {
        let returnObject;
    
        obj.forEach(node => {
            if (node.name === path) {
                returnObject = node.children;
            }
        });
    
        return returnObject;
    }, root.children);

    render({
        name,
        children: treemapData
    });
}

const getPath = (element, separator) => element.ancestors().reverse().map(elem => elem.data.name).join(separator)

const render = data => {
    const root = treemap(data);
    
    const svg    = d3.select('.treemap').attr("viewBox", [0, 0, width, height]);
    const newSvg = d3.select('.temp')
                     .attr('viewBox', [0, 0, width, height]);

    const barContainer = d3.select(".pointer").attr("viewBox", [0, -30, width, 30])

    // Create shadow
    newSvg.append('filter')
          .attr('id', 'shadow')
          .append('feDropShadow')
          .attr('flood-opacity', 0.5)
          .attr('dx', 0)
          .attr('dy', 0)
          .attr('stdDeviation', 2);

    // Create node
    const node = newSvg.selectAll('g')
                       .data(d3.nest().key(d => d.height).entries(root.descendants()))
                       .join('g')
                       .attr('filter', 'url(#shadow)')
                       .selectAll('g')
                       .data(d => d.values)
                       .join('g')
                       .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Create title
    node.append('title')
        .text(d => {
            const path = getPath(d, '/');
            const icon = path.includes('.') ? '📋' : '🗂️';

            d.path = getPath(d, '.');

            return `${icon} ${getPath(d, '/')}\n${(d.value)}`;
        });

    // Create rectangle
    node.append('rect')
        .attr('id', d => d.nodeId = uuidv4())
        .attr('fill', d => color(d.depth))
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .each(function(d, i){console.log(d.nodeId)});

    // Create clip path for text
    node.append('clipPath')
        .attr('id', d => d.clipId = uuidv4())
        .append('use')
        .attr('href', d => `#${d.nodeId}`);
    
    // Create labels
    node.append('text')
        .attr('clip-path', d => `url(#${d.clipId})`)
        .selectAll('tspan')
        .data(d => [d.data.name, (d.value)])
        .join('tspan')
        .attr('fill-opacity', (d, i, nodes) => i === nodes.length - 1 ? 0.75 : null)
        .text(d => d)
    
    // Set position for parents
    node.filter(d => d.children)
        .selectAll('tspan')
        .attr('dx', 5)
        .attr('y', 15);
    
    // Highlight leaf boxes
    node.filter(d => !d.children)
        .selectAll('rect')
        .style("fill", "rgb(12,240,233)");

    // Add image to leaf
    node.filter(d => !d.children && d.x1-d.x0 > 10 && d.y1-d.y0 > 50)
        .append("svg:image")
        .attr('x', 5)
        .attr('y', 20)
        .attr('width', d=>d.x1-d.x0-10)
        .attr('height', d=>d.y1-d.y0-20)
        .attr("xlink:href", "/static/doggie.jpeg")
        
    // Set position for everything else that doesn't have children
    node.filter(d => !d.children)
        .selectAll('tspan')
        .attr('x', 3)
        .attr('y', (d, i, nodes) => i === nodes.length - 1 ? 30 : 15);

    // Add click event
    node.filter(d => d !== root)
        .attr('cursor', 'pointer')
        .on('click', d => zoomIn(d.path, data));

    // Fade out old svg
    svg.transition()
    // .ease(d3.easeCubicIn)
       .duration(animationSpeed)
       .attrTween('opacity', () => d3.interpolate(1, 0))

    // Fade in new svg
    newSvg.transition()
    // .ease(d3.easeCubicOut)
          .duration(animationSpeed)
          .attrTween('opacity', () => d3.interpolate(0, 1))
          .attr('class', 'treemap')
          .on('end', () => {
              // At the very end, swap classes and remove everything from the temporary svg
              svg.attr('class', 'temp').selectAll('*').remove();
          });

    d3.select('select').on('change', function () {
        color = d3.scaleSequential([8, 0], d3[d3.select(this).property('value')]);

        node.select('rect').attr('fill', d => color(d.depth));
    });
};

(async () => {
    data = await d3.json(filePath).then(data => data);

    render(data);
    
    d3.select('button').on('click', () => render(data));
})();