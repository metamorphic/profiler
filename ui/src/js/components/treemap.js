import React from 'react';
import StoreWatchMixin from '../mixins/store-watch-mixin';
import AppStore from '../stores/app-store';
import * as AppActions from '../actions/app-actions';
import TopNavigation from './top-navigation';

function getTreemap() {
  return {
    root: {
      label: 'catalog',
      groups: AppStore.getTreemap()
    }
  }
}

const margin = {top: 20, right: 0, bottom: 0, left: 0};
const width = 960;
const height = 500 - margin.top - margin.bottom;
const formatNumber = d3.format(',d');
let transitioning;

const x = d3.scale.linear().domain([0, width]).range([0, width]);

const y = d3.scale.linear().domain([0, height]).range([0, height]);

let svg, grandparent;

const treemap = d3.layout.treemap()
  .children((d, depth) => depth ? null : d._children)
  .sort((a, b) => a.value - b.value)
  .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
  .round(false);

function initialize(root) {
  root.x = root.y = 0;
  root.dx = width;
  root.dy = height;
  root.depth = 0;
}

// Aggregate the values for internal nodes. This is normally done by the
// treemap layout, but not here because of our custom implementation.
// We also take a snapshot of the original children (_children) to avoid
// the children being overwritten when when layout is computed.
function accumulate(d) {
  return (d._children = d.children)
    ? d.value = d.children.reduce((p, v) => p + accumulate(v), 0)
    : d.value;
}

// Compute the treemap layout recursively such that each group of siblings
// uses the same size (1×1) rather than the dimensions of the parent cell.
// This optimizes the layout for the current zoom state. Note that a wrapper
// object is created for the parent node for each group of siblings so that
// the parent’s dimensions are not discarded as we recurse. Since each group
// of sibling was laid out in 1×1, we must rescale to fit using absolute
// coordinates. This lets us use a viewport to zoom.
function layout(d) {
  if (d._children) {
    treemap.nodes({_children: d._children});
    d._children.forEach(c => {
      c.x = d.x + c.x * d.dx;
      c.y = d.y + c.y * d.dy;
      c.dx *= d.dx;
      c.dy *= d.dy;
      c.parent = d;
      layout(c);
    });
  }
}

function display(d) {
  grandparent
    .datum(d.parent)
    .on('click', transition)
    .select('text')
    .text(name(d));

  const g1 = svg.insert('g', '.grandparent')
    .datum(d)
    .attr('class', 'depth');

  const g = g1.selectAll('g')
    .data(d._children)
    .enter().append('g');

  g.filter(d => d._children)
    .classed('children', true)
    .on('click', transition);

  g.selectAll('.child')
    .data(d => d._children || [d])
    .enter().append('rect')
    .attr('class', 'child')
    .call(rect);

  g.append('rect')
    .attr('class', 'parent')
    .call(rect)
    .append('title')
    .text(d => formatNumber(d.value));

  g.append('text')
    .attr('dy', '.75em')
    .text(d => d.name)
    .call(text);

  function transition(d) {
    if (transitioning || !d) return;
    transitioning = true;

    const g2 = display(d);
    const t1 = g1.transition().duration(750);
    const t2 = g2.transition().duration(750);

    // Update the domain only after entering new elements.
    x.domain([d.x, d.x + d.dx]);
    y.domain([d.y, d.y + d.dy]);

    // Enable anti-aliasing during the transition.
    svg.style('shape-rendering', null);

    // Draw child nodes on top of parent nodes.
    svg.selectAll('.depth').sort((a, b) => a.depth - b.depth);

    // Fade-in entering text.
    g2.selectAll('text').style('fill-opacity', 0);

    // Transition to the new view.
    t1.selectAll('text').call(text).style('fill-opacity', 0);
    t2.selectAll('text').call(text).style('fill-opacity', 1);
    t1.selectAll('rect').call(rect);
    t2.selectAll('rect').call(rect);

    // Remove the old node when the transition is finished.
    t1.remove().each('end', () => {
      svg.style('shape-rendering', 'crispEdges');
      transitioning = false;
    });
  }

  return g;
}

function text(text) {
  text.attr('x', d => x(d.x) + 6)
    .attr('y', d => y(d.y) + 6);
}

function rect(rect) {
  rect.attr('x', d => x(d.x))
    .attr('y', d => y(d.y))
    .attr('width', d => x(d.x + d.dx) - x(d.x))
    .attr('height', d => y(d.y + d.dy) - y(d.y));
}

function name(d) {
  return d.parent
    ? name(d.parent) + '.' + d.name
    : d.name;
}

/* attempt to truncate text but couldn't get to work
function wrap() {
  var self = d3.select(this);
  var textLength = self.node().getComputedTextLength();
  var text = self.text();
  while (textLength > (width - 2 * padding) && text.length > 0) {
    text = text.slice(0, -1);
    self.text(text + '...');
    textLength = self.node().getComputedTextLength();
  }
}*/

export default React.createClass({

  mixins: [StoreWatchMixin(getTreemap)],

  componentWillMount() {
    AppActions.getTreemap();
  },

  componentDidMount() {
    svg = d3.select('#chart').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.bottom + margin.top)
      .style('margin-left', -margin.left + 'px')
      .style('margin.right', -margin.right + 'px')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .style('shape-rendering', 'crispEdges');

    grandparent = svg.append('g').attr('class', 'grandparent');

    grandparent.append('rect')
      .attr('y', -margin.top)
      .attr('width', width)
      .attr('height', margin.top);

    grandparent.append('text')
      .attr('x', 6)
      .attr('y', 6 - margin.top)
      .attr('dy', '.75em');
  },

  componentWillUpdate(nextProps, nextState) {
    if (nextState.root.groups.length) {
      const root = reformatTree(nextState.root);
      initialize(root);
      accumulate(root);
      layout(root);
      display(root);
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return !!nextState.root.groups.length;
  },

  render() {
    return (
      <section className="content">
        <TopNavigation/>
        <p id="chart"/>
      </section>
    );
  }
});

function reformatTree(node) {
  let n;
  const children = [];
  let hasChildren = false;
  if (node.groups && (n = node.groups.length)) {
    for (let i = 0; i < n; i++) {
      children.push(reformatTree(node.groups[i]));
    }
    hasChildren = true;
  }
  const obj = {name: node.label};
  if (hasChildren) {
    obj.children = children;
  } else {
    obj.value = node.weight;
  }
  return obj;
}
