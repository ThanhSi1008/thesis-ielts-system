import java.util.*;

public class FoundationVocabUnit {
    private String id;
    private String bookId;
    private String title;
    private Integer order;
    private String storyTitle;
    private String storyContent;
    private String storyImageUrl;
    private Date createdAt;
    private Date updatedAt;
    private FoundationVocabBook book;
    private List<FoundationVocabItem> words;
    private List<FoundationVocabExercise> exercises;
    private List<FoundationVocabQuestion> questions;
    private List<FoundationVocabProgress> progress;
}
