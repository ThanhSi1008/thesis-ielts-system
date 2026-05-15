import java.util.*;

public class Flashcard {
    private String id;
    private String deckId;
    private String front;
    private String back;
    private List<String> tags;
    private Date due;
    private Double stability;
    private Double difficulty;
    private Integer elapsedDays;
    private Integer scheduledDays;
    private Integer reps;
    private Integer lapses;
    private Date lastReview;
    private Date nextReviewDate;
    private CardState cardState;
    private String cardTypeId;
}
