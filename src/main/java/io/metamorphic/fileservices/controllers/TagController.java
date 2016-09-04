package io.metamorphic.fileservices.controllers;

import io.metamorphic.fileservices.repositories.DataColumnRepository;
import io.metamorphic.fileservices.repositories.TagRepository;
import metastore.models.DataColumn;
import metastore.models.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

/**
 * Created by markmo on 5/10/2015.
 */
@Controller
public class TagController {

    @Autowired
    private DataColumnRepository dataColumnRepository;

    @Autowired
    private TagRepository tagRepository;

    @RequestMapping(value = "api/columns/{columnId}/tags/{tagName}", method = RequestMethod.POST)
    @ResponseBody
    public String addTag(@PathVariable("columnId") Long columnId, @PathVariable("tagName") String tagName) {
        List<Tag> tags = tagRepository.findByNameIgnoreCase(tagName);
        Tag tag;
        if (tags.isEmpty()) {
            tag = new Tag();
            tag.setName(tagName);
            tagRepository.save(tag);
        } else {
            tag = tags.get(0);
        }
        DataColumn column = dataColumnRepository.findOne(columnId);
        List<Tag> tagList = column.getTags();
        tagList.add(tag);
        column.setTags(tagList);
//        column.addTag(tag);
        dataColumnRepository.save(column);
        return "OK";
    }

    @RequestMapping(value = "api/columns/{columnId}/tags/{tagName}", method = RequestMethod.DELETE)
    @ResponseBody
    public String removeTag(@PathVariable("columnId") Long columnId, @PathVariable("tagName") String tagName) {
        List<Tag> tags = tagRepository.findByNameIgnoreCase(tagName);
        Tag tag;
        if (tags.isEmpty()) {
            return "NOT OK";
        } else {
            tag = tags.get(0);
        }
        DataColumn column = dataColumnRepository.findOne(columnId);
        List<Tag> tagList = column.getTags();
        tagList.remove(tag);
        column.setTags(tagList);
//        column.getTags().remove(tag);
        dataColumnRepository.save(column);
        return "OK";
    }
}
