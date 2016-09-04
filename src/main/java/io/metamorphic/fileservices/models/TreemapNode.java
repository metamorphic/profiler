package io.metamorphic.fileservices.models;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by markmo on 11/09/2015.
 */
public class TreemapNode {

    private Long id;
    private String label;
    private int weight;
    List<TreemapNode> groups = new ArrayList<>();

    public TreemapNode(Long id, String label) {
        this.id = id;
        this.label = label;
    }

    public Long getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public List<TreemapNode> getGroups() {
        return groups;
    }

    public void addGroup(TreemapNode node) {
        groups.add(node);
    }
}
