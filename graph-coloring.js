class Vertex {
	constructor (name) {
		this.name = name;
		this.color = null;
		this.edges = [];
	}
	toString () {
		return "Vertex (" + this.name + ", " + this.color + ")";
	}
}

class Edge {
	constructor (name, a, b) {
		this.name = name;
		this.a = a;
		this.b = b;
		a.edges.push(this);
		b.edges.push(this);
	}
	toString () {
		return "Edge (" + this.a.toString() + ", " + this.b.toString() + ")";
	}
}

class Graph {
	constructor (vertices, edges) {
		this.vertices = vertices;
		this.edges = edges;
	}
	toString () {
		
		return "Graph ( V = (" + this.vertices.join(", ") + "), E = (" + this.edges.join(",") + "))";
	}
}

/**
 * This (non-optimal) graph-coloring algorithm works by picking the first vertex it finds in the graph
 * and picking the lowest possible color number as it loops through the nodes.
 * For a graph of order (N, M), it should be at most O(N^2 * M^2), since there are two loops through the vertices and two loops through the edges,
 * although it is likely better, since once a vertex is colored, it is skipped in the top loop, and the other loops all attempt to exit early.
 * Another variation could be to order the vertices by degree first (highest to lowest).
**/
function colorGraph (graph) {
	var coloring = [];
	for (var vertex of graph.vertices) {
		if (vertex.color) continue;
		colorVertex(vertex);
		for (var edge of vertex.edges) {
			var opposite = edge.b === vertex ? edge.a : edge.b;
			if (opposite.color) continue;
			colorVertex(opposite);
		}
	}
}

function colorVertex (vertex) {
	if (vertex.color) return;
	var color = 1;
	loop:
	while (!vertex.color) {
		var found = false;
		for (var edge of vertex.edges) {
			var opposite = edge.b === vertex ? edge.a : edge.b;
			if (opposite.color && opposite.color === color) {
				found = true;
				break;
			}
		}
		if (!found) {
			vertex.color = color;
			return;
		}
		color++;
	}
}

// This particular graph is from MIT 6.024J, Fall 2010, Lecture 6: Graph Theory and Coloring,
var v1 = new Vertex('v1');
var v2 = new Vertex('v2');
var v3 = new Vertex('v3');
var v4 = new Vertex('v4');
var v5 = new Vertex('v5');
var e1 = new Edge('e1', v1, v2);
var e2 = new Edge('e2', v1, v3);
var e3 = new Edge('e3', v1, v4);
var e4 = new Edge('e4', v2, v3);
var e5 = new Edge('e5', v3, v4);
var e6 = new Edge('e6', v4, v5);
var graph = new Graph([v1, v2, v3, v4, v5], [e1, e2, e3, e4, e5, e6]);

colorGraph(graph);
console.log(graph.toString());