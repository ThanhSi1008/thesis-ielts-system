import java.util.*;

public class CardType {
    private String id;
    private String userId;
    private String name;
    private String description;
    private Boolean isBuiltIn;
    private Date createdAt;
    private Date updatedAt;
    private List<CardTypeField> fields;
    private List<CardTemplate> templates;
    private List<Flashcard> flashcards;
}
