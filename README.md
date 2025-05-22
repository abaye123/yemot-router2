# yemot-router2

ספריה שמאפשרת לתכנת מערכות טלפוניות בקלות באמצעות [מודול API](https://f2.freeivr.co.il/post/76) של חברת 'ימות המשיח'.

מטרת הספריה לאפשר תקשורת מול המערכת הטלפונית בצורה נקיה וקריאה:

- הרצה רציפה של הקוד מתחילה ועד סוף, תוך שמירת הstate של השיחה בין הקריאות, בצורה שקופה לחלוטין
- יצירת התשובות על ידי קריאה למתודות של השיחה במקום יצירה ידנית של הסטרינגים
- אפשרויות נוחות נוספות כגון מטפל בשגיאות, הסרה של תווים לא חוקיים, לוג אוטומטי מפורט (אופציונלי)
- תיעוד מפורט מוטמע ומוצג תוך כדי עריכה ‫(JSDoc)
- [תמיכה בTypeScript](#typescript)
- ועוד אפשרויות רבות! פירוט בתיעוד 👇

# התקנה

```bash
npm install yemot-router2
```

# יומן שינויים/הוראות שדרוג

⚙️ משדרגים מגרסה קודמת? ראו [changelog](./CHANGELOG.md)!

# תיעוד

מומלץ להשתמש בכפתור "תוכן העניינים" האוטומטי כדי לנווט בתיעוד:
![CleanShot 2023-05-02 at 04 14 20@2x](https://user-images.githubusercontent.com/78599753/235558893-e8b9ebe0-e2a1-4740-8c96-eb370f9a3952.png)

# אתחול הראוטר ושימוש בסיסי

הספריה עובדת על ידי חיקוי של Express Router, כך שאופן השימוש הוא די דומה. דוגמה:

```js
import { YemotRouter } from 'yemot-router2';
const router = YemotRouter();

router.get('/', async (call) => {
    return call.id_list_message([{
        type: 'text',
        data: 'שלום עולם'
    }])
});
```

את הראוטר יש לחבר לאפליקציית express על ידי `app.use`, כרגיל.

הראוטר מקבל פונקצייה אסינכרונית, שהארגומנט שהיא מקבלת מהראוטר הוא אובייקט `Call` (יבואר בהמשך), המייצג את השיחה, ובאמצעות המתודות שלו ניתן לקבל מידע אודות השיחה, להשמיע/לבקש נתונים מהמחייג, להפנות אותו לשלוחה אחרת, ועוד.

**👨‍💻 דוגמה בסיסית: [example.js](example.js)**

**טיפ**: מומלץ מאוד לא להגדיר בשלוחה `api_hangup_send=no`, לביצועי זיכרון טובים יותר.

## אפשרויות הראוטר

הראוטר מקבל את הפונקציות הבאות, כולן אופציונליות:

- **timeout**: ‫ זמן המתנה לקבלת נתון מהמשתמש (במילישניות). במידה ולא התקבל הנתון בזמן הנ"ל, השיחה תימחק מהactiveCalls וגם אם המשתמש יקיש השרת יקבל אותו כשיחה חדשה.<br>
‫מקבל מספר מילישיניות, או מחרוזת הקבילה ע"י ספריית [ספריית ms](https://npmjs.com/ms).<br>
‫מכסה גם מקרי קצה שלא התקבלה מימות הקריאה עם hangup=yes.<br>
‫יש לשים לב לא להגדיר ערך נמוך שמחייג לגיטימי שלא הקיש מיד תשובה עלול להיתקל ב-timeout.
- **printLog** (בוליאני): האם להדפיס לוג מפורט על כל קריאה לשרת, ניתוק שיחה וכולי. שימושי לפיתוח.
- **uncaughtErrorHandler**: (פונקציה) ‫ פונקציה לטיפול בשגיאות לא מטופלות בתוך שיחה, שימושי לדוגמה לשמירת לוג + השמעת הודעה למשתמש, במקום קריסה של השרת, והמשתמש ישמע "אין מענה משרת API".
ראה דוגמה ב[example.js](example.js).

בנוסף ניתן להעביר אופציות של אקספרס ראוטר עצמו - ראה [פירוט בתיעוד express.js](https://expressjs.com/en/api.html#express.router).

# מתודות אובייקט ה`Call`

## `read(messages, mode, options?)`

מתודה לקבלת נתון מהמחייג, מחזירה `Promise` עם התשובה (במקרה של בקשת הקלטה, יחזור נתיב הקובץ).<br>
פירוט נוסף על `read`: [https://f2.freeivr.co.il/post/78283](https://f2.freeivr.co.il/post/78283)

### הארגומנט `messages`

ההודעות שיושמעו למחייג לפני קבלת הנתון.<br>
מערך של אובייקטי "הודעה" (ראה [פירוט בהמשך](#אובייקט-message)), שיושמעו למשתמש ברצף.

### הארגומנט `mode`

מגדיר את סוג הנתון שמבקשים מהמחייג:

`tap` = הקשות

`stt` = זיהוי דיבור

`record` = הקלטה

### הארגומנט `options`

בפרמטר הזה, ניתן להעביר אפשרויות נוספות, כגון סך הקשות מינימלי, מקסימלי, וכו'.

#### הקשות

```js
let options = {
    /* שם הערך בימות
    ברירת מחדל, נקבע אוטומטית,
    val_1, val_2, val_3 ...
    */
    val_name: "val_x",
    
    /* האם לבקש את הערך שוב אם קיים. */
    re_enter_if_exists: false,
    
    /* כמות הספרות המקסימלית שהמשתמש יוכל להקיש */
    max_digits: "*",
    
    /* כמות ספרות מינימלית */
    min_digits: 1,
    
    /* שניות להמתנה */
    sec_wait: 7,
    
    /* צורת ההשמעה למשתמש את הקשותיו
    באם מעוניינים במקלדת שונה ממקלדת ספרות, כגון EmailKeyboard או HebrewKeyboard, יש להכניס כאן את סוג המקלדת
    [ראו example.js]
    האופציות הקיימות:
    "Number" | "Digits" | "File" | "TTS" | "Alpha" | "No" | "HebrewKeyboard" |
    "EmailKeyboard" | "EnglishKeyboard" | "DigitsKeyboard" | "TeudatZehut" |
    "Price" | "Time" | "Phone" | "No"
    פירוט על כל אופציה ניתן למצוא בתיעוד מודול API של ימות המשיח, תחת"הערך השישי (הקשה)".
    */
    
    typing_playback_mode: "No",
    
    /* האם לחסום הקשה על כוכבית */
    block_asterisk_key: false,
    
    /* האם לחסום הקשה על אפס */
    block_zero_key: false,
    
    /* החלפת תווים*/
    replace_char: "",
    
    /* ספרות מותרות להקשה - מערך
    [1, 2, 3 ...]
    */
    digits_allowed: [],
    
    /* כמה פעמים להשמיע את השאלה לפני שליחת תשובת "None" (כלומר תשובה ריקה). ברירת מחדל פעם אחת */
    amount_attempts: "",
    
    /*
    האם לאפשר תשובה ריקה - או שלאחר זמן ההמתנה יושמע "לא הוקשה בחירה" וידרוש להקיש
    ברירת מחדל לא מאפשר תשובה ריקה
    */
    allow_empty: false,
    
    /*
    הערך שיישלח כשלא הוקשה תשובה. ברירת מחדל "None"
    ניתן להעביר גם ערכים שאינם מחרוזת, לדוגמה null והערך שיתקבל מהread יהיה null ולא 'null'
    */
    empty_val: "None",
    
    /* האם לחסום שינוי שפת מקלדת */
    block_change_keyboard: false,
}
```

#### הקלטה

ערכי ברירת מחדל - הקלטות:

```js
const options = {
    /* נתיב לשמירת ההקלטה - שלוחה בלבד, ברירת מחדל שלוחה נוכחית, או api_dir אם מוגדר */
    path: '',

    /* שם קובץ (ללא סיומת) לשמירת ההקלטה, ברירת מחדל - ממוספר אוטומטית כקובץ הגבוה בשלוחה */
    file_name: '',

    /*
    ברירת מחדל משמיע תפריט לאישור ההקלטה/הקלטה מחדש, ניתן להגדיר שמיד בהקשה על סולמית ההקלטה תאושר
    */
    no_confirm_menu: false,

    /* האם לשמור את ההקלטה באם המשתמש ניתק באמצע הקלטה */
    save_on_hangup: false,

    /*
    במידה והוגדר שם קובץ לשמירה (file_name) וכבר קיים קובץ כזה,
    האם לשנות את שם הקובץ הישן ולשמור את החדש בשם שנבחר (ברירת מחדל), או לצרף את ההקלטה החדשה לסוף הקובץ הישן
    */
    append_to_existing_file: false,

    /* כמות שניות מינימלית להקלטה, ברירת מחדל אין מינימום */
    min_length: '',

    /* כמות שניות מקסימלית להקלטה, ברירת מחדל ללא הגבלה */
    max_length: ''
};
```

#### זיהוי דיבור

ערכי ברירת מחדל - זיהוי דיבור:

```js
const options = {
    /*
    שפת הדיבור
    ברירת מחדל עברית או מה שהוגדר בlang בשלוחה,
    רשימת השפות הזמינות להגדרה: https://did.li/m1lrl
    */
    lang: '',

    /*
    האם לחסום הקשה במצב זיהוי דיבור
    ברירת מחדל מאפשר להקיש תוך כדי הדיבור, כלומר המחייג בוחר אם להקיש או לדבר
    */
    block_typing: false,

    /*
    מקסימום ספרות שאפשר להקיש, באם לא נחסמה ההקשה תוך כדי דיבור
    ברירת מחדל לא מוגבל
    */
    max_digits: '',

    /*
    האם להשתמש במנוע הדיבור של הקלטות - נצרך עבור זיהוי טקסט ארוך
    באם מפעילים הגדרה זו, לא ניתן לקלוט הקשות תוך כדי דיבור
    */
    use_records_recognition_engine: false,

    /*
    אחרי כמה שניות של שקט לסיים את ההקלטה,
    רלוונטי רק אם משתמשים במנוע זיהוי טקסטים ארוכים (use_records_recognition_engine)
    */
    quiet_max: '',

    /*
    * מספר שניות מרבי להקלטה, ברירת מחדל: ללא הגבלה
    */
    length_max: ''
};
```

## `go_to_folder(target)`

מתודה להעברת השיחה לשלוחה מסוימת במערכת הנוכחית.

ניתן לכתוב נתיב יחסי לשלוחה הנוכחית או לשלוחה הראשית, פירוט על האופציות הזמינות ניתן לקרוא [כאן](https://f2.freeivr.co.il/post/58).

ניתן גם להעביר בפרמטר folder את הסטרינג `hangup`, וכך לנתק את השיחה, או להשתמש בקיצור [`call.hangup()`](#hangup).

## `restart_ext()`

הפעלה מחדש של השלוחה הנוכחית.

קיצור לתחביר הבא:

```js
call.go_to_folder(`/${call.ApiExtension}`);
```

## `one_level_back()`

חזרה שלוחה אחת אחורה.

קיצור לתחביר הבא:

```js
call.go_to_folder('..');
```

## `hangup()`

ניתוק השיחה. קיצור לתחביר הבא:

```js
call.go_to_folder('hangup');
```

## `id_list_message(messages, options?)`

במתודה זו ניתן להשמיע למשתמש הודעה אחת, או מספר הודעות ברצף.<br>
המתודה מקבלת מערך של הודעות ([אובייקט message](#אובייקט-message)) ומשמיעה אותן למשתמש.

⚠️ שים לב! ⚠️

לאחר השמעת ההודעות, השיחה תצא אוטומטית מהשלוחה!

באם מעוניינים לשרשר פעולה נוספת לאחר ההשמעה, לדוגמה להשמיע הודעה ואז לבצע `read` (קבלת נתונים נוספים), יש להגדיר בארגומנט ה`options` את `prependToNextAction` ל`true`.

</div>

## `routing_yemot(number)`

מתודה להעברת השיחה למערכת אחרת בימות המשיח ללא עלות יחידות, באמצעות "ראוטינג ימות".

הפונקציה מקבלת ארגומנט יחיד - סטרינג של מספר מערכת בימות להעברת השיחה.

ניתן גם לנתב את השיחה ממערכת בשרת הפריווט למערכת בשרת הרגיל ולהיפך.

## `send(data)`

ניתן להשתמש במתודה זו כדי לשלוח סטרינג חופשי לחלוטין, לדוגמה עבור פונקציונליות שעדיין לא נתמכת בספרייה.

במתודה זו יש להעביר את הסטרינג בדיוק כפי שמעוניינים שהשרת של ימות יקבל אותו, והוא לא עובר ולידציה או עיבוד.

כדי להשתמש לבקשת מידע - לדוגמה מעבר לסליקת אשראי, יש לשלב עם קריאות ל

```js
await call.blockRunningUntilNextRequest();
```

# `values`

מכיל את כל הפרמטרים שנשלחו מימות -

אם הבקשה נשלחה ב-‫`HTTP GET`, יכיל את ה‫`query string`,

אם הבקשה נשלחה ב-‫`HTTP POST` ‫(`api_url_post=yes`), יכיל את ה‫`body`

# אובייקט `message`

כל אובייקט הודעה צריך להיות במבנה הבא:

```js
{ type: string, data: string }
```

כאשר `type` הוא סוג הודעה מתוך הטבלה שלהלן, ו`data` הוא המידע עצמו - `string`,<br>
מלבד כאשר ה`type` הוא `zmanim`/`music_on_hold`, שאז ה`data` יהיה אובייקט  - מפורט מתחת לטבלה:

- [zmanim](#מבנה-הdata-בzmanim)
- [music_on_hold](#מבנה-הdata-ב-music_on_hold)

**סוגי הודעות נתמכים:**

<div dir="rtl" text-align="right">

| סוג              | תיאור מקוצר                                                                            | דוגמה                                                                  | הערות                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`           | הקראת טקסט                                                                             | `דוגמה לטקסט דוגמה`                                                    | שים לב ל[אזהרה מתחת לטבלה](#תווים-לא-חוקיים-בהקראת-טקסט) לגבי תווים שלא ניתן להקריא                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `file`           | השמעת קובץ אודיו                                                                       | `/1/002`, ניתן לכתוב רק את שם הקובץ `002` אם הקובץ נמצא בתקייה הנוכחית | אין לכתוב סיומת קובץ. [ניתן להשמיע ממאגר גלובלי](https://f2.freeivr.co.il/topic/56/%D7%9E%D7%95%D7%93%D7%95%D7%9C-api-%D7%AA%D7%A7%D7%A9%D7%95%D7%A8-%D7%A2%D7%9D-%D7%9E%D7%97%D7%A9%D7%91%D7%99%D7%9D-%D7%95%D7%9E%D7%9E%D7%A9%D7%A7%D7%99-%D7%A0%D7%AA%D7%95%D7%A0%D7%99%D7%9D-%D7%97%D7%99%D7%A6%D7%95%D7%A0%D7%99%D7%99%D7%9D/4?_=1682984503080#:~:text=%D7%94%D7%A9%D7%9E%D7%A2%D7%AA%20%D7%A7%D7%95%D7%91%D7%A5%20%D7%9E%D7%AA%D7%95%D7%9A%20%D7%9E%D7%90%D7%92%D7%A8%20%D7%92%D7%9C%D7%95%D7%91%D7%9C%D7%99). |
| `speech`         | הקראה אוטומטית של קובץ TTS                                                             | נתיב לקובץ TTS או שם קובץ TTS בתקיה הנוכחית                            | ללא הסיומת                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `digits`         | השמעת ספרות                                                                            | `105` - ישמיע "אחת אפס חמש"                                            | שימושי בעיקר להקראת מספר טלפון                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `number`         | השמעת מספר                                                                             | `105` - ישמיע "מאה וחמש"                                               | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `alpha`          | השמעת אותיות באנגלית                                                                   | `abc`, ישמיע "איי, בי, סי"                                             | לא תומך בעברית                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `zmanim`         | השמעת שעה                                                                              | אובייקט. פירוט בנפרד 👇                                                 | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `system_message` | השמעת הודעת מערכת                                                                      | `M1005` או `1005`                                                      | [רשימת הודעות המערכת](https://f2.freeivr.co.il/post/3)                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `music_on_hold`  | השמעת מוזיקה בהמתנה                                                                    | `{ musicName: 'ztomao', maxSec: 10 }`                                  | הפרמור maxSec רשות. ראה [כאן](https://f2.freeivr.co.il/topic/44/%D7%9E%D7%95%D7%96%D7%99%D7%A7%D7%94-%D7%91%D7%94%D7%9E%D7%AA%D7%A0%D7%94) סוגי מוזיקה זמינים והוראות ליצירת חדש.                                                                                                                                                                                                                                                                                                                                    |
| `dateH`           | השמעת תאריך עברי                                                                       | פורמט `DD/MM/YYYY` - 28/07/2022                                        | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `date`          | השמעת תאריך לועזי                                                                      | פורמט תאריך לועזי `DD/MM/YYYY`, ישמיע את התאריך העברי המתאים           | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `go_to_folder`   | נתיב יחסי לשלוחה הנוכחית או לשלוחה הראשית, ראה [כאן](https://f2.freeivr.co.il/post/58) | העברת השיחה לשלוחה אחרת                                                | לא מומלץ, עדיף להשתמש ב [`call.go_to_folder`](#go_to_folderpath). לא ניתן לשרשר הודעות נוספות לאחר סוג זה.                                                                                                                                                                                                                                                                                                                                                                                                           |
</div>

### תווים לא חוקיים בהקראת טקסט

⚠️ שימו לב! ⚠️

לא ניתן להחזיר לימות את התוים:

נקודה,מקף,גרש,גרשיים,&

העברת אחד מהתוים הנ"ל יגרום לזריקת שגיאה, אלא אם כן נאפשר הסרת תווים לא חוקיים שקטה:

**כאשר מעבירים טקסט להקראה (`'type: 'text`) ניתן להגדיר הסרה של תווים לא חוקיים**, כלומר שבמקום לזרוק שגיאה הם פשוט יוסרו מהתשובה שתוחזר לימות.

ההגדרה היא `removeInvalidChars`, אותה ניתן להגדיר בשתי רמות, ברמת הודעה בודדת, או ברמת כל ה`read`/`id_list_message`.

דוגמאות:

- ברמת ההודעה המסוימת - העברת הפרמטר `removeInvalidChars` באובייקט ההודעה:

```js
{
  type: "text",
  data: "טקסט. בעייתי.",
  removeInvalidChars: true
}
```

- ברמת כל ה`read`/`id_list_message` - העברת הפרמטר `removeInvalidChars` באובייקט האפשרויות.

דוגמה ל`read`:

```js
const resp = await call.read(messagesWidthInvalidChars, 'tap', { removeInvalidChars: true });
```

דוגמה ל`id_list_message`:

```js
call.id_list_message(messagesWidthInvalidChars, { removeInvalidChars: true });
```

### מבנה הdata ב`zmanim`

```js
{
    time: string, // optional, default: "T" (current time)
    zone: string, // optional, default: "IL/Jerusalem",
    difference: string // optional, default: 0
};
```

#### הערך `time`

סוג הזמן שרוצים להשמיע.

ברירת מחדל: "`T`" = השעה הנוכחית.
השמעת שעה - `THH:MM`,
או זמן הלכתי - ניתן לראות [כאן](https://f2.freeivr.co.il/post/82875) את רשימת הזמנים שניתן לחשב מהם זמן.

#### הערך `zone`

אזור הזמן שעבורו יש לחשב את הזמנים.

ברירת מחדל: `IL/Jerusalem`.

ניתן לראות [כאן](https://f2.freeivr.co.il/post/82868) את רשימת אזורי הזמן הקיימים במערכת.

#### הערך `difference`

ערך זה משמש להוספה/הסרה מלאכותית של זמן על הזמן שמשמיעים.

באם לא יועבר פרמטר זה, יושמע הזמן ללא שינוי.

הערך **`difference`** מכיל קודם את סוג הפעולה - פלוס (+) להוספת זמן, או מינוס (-) להפחתת זמן, ואז את הזמן על פי הצורה הבאה: Y - שנה M - חודש D - יום H - שעה m - דקה S - שניה s - אלפית שניה למשל, עבור 20 דקות אחורה יש להגדיר `m20-`, עבור 3 שעות קדימה יש לרשום `H3+`. עבור יומיים אחורה יש לרשום `D1-`.

לדוגמה, עבור השמעת זמן שקיעת החמה מחר בעיר בני ברק:

```js
const messages = [{
    type: 'zmanim',
    data: {
        time: 'sunset',
        zone: 'IL/Bney_Brak',
        difference: '+1D'
    }
}];
```

### מבנה הdata ב-**music_on_hold**

```js
{
    musicName: string,
    maxSec: number // optional
};
```

[כאן](https://f2.freeivr.co.il/topic/44/%D7%9E%D7%95%D7%96%D7%99%D7%A7%D7%94-%D7%91%D7%94%D7%9E%D7%AA%D7%A0%D7%94) סוגי מוזיקה זמינים והוראות ליצירת חדשה.

# ברירות מחדל

-------------
**שימו לב:**

אפשרות זו זמינה בגרסה 6.0 ומעלה

אפשרות זו הינה אופציונלית לחלוטין, ניתן להמשיך להעביר אובייקט אפשרויות בכל `read`/`id_list_message` כמו קודם

-------------

ניתן להגדיר ברירות מחדל בדרכים הבאות:

- ברירות מחדל של המערכת - שהן כמו ברירות המחדל של ימות ([defaults.js](lib/defaults.js))
- רמת ראוטר
- רמת שיחה
- ספציפית לקריאת `read`/`id_list_message` מסויימת

האפשרויות ימוזגו עם סדר קדימויות. הסדר הוא:
ברירות המחדל של הספרייה שנמצאת ב- [lib/defaults.js](lib/defaults.js),
ברמת מופע ראוטר,
ברמת מופע שיחה,
ברמת קריאה ספציפית.

כל אפשרות מקבלת קדימות ודורסת את זו שלפניה.

דוגמה:

```js
const router = YemotRouter({
    printLog: true,
    defaults: {
        removeInvalidChars: true,
        read: {
            timeout: 30000
        }
    }
});

// אפשר גם כך:
// router.defaults.read.timeout = 30000;

router.get('/', async (call) => {
    // הtimeout יהיה 30 שניות
    await call.read([{ type: 'text', data: 'היי, תקיש 1' }], 'tap', {
        max_digits: 1,
        digits_allowed: [1]
    });

    // הtimeout יהיה 40 שניות
    call.defaults.read.timeout = 40000;
    await call.read([{ type: 'text', data: 'היי, תקיש 1' }], 'tap', {
        max_digits: 1,
        digits_allowed: [1]
    });

    // הtimeout יהיה 60 שניות
    await call.read([{ type: 'text', data: 'היי, תקיש 1' }], 'tap', {
        max_digits: 1,
        digits_allowed: [1],
        timeout: 60000
    });
});
```

בדוגמה מאתחלים את הראוטר עם הגדרה של timeout של 1000 שניות,
לאחר מכן בתוך השיחה משנים אותו ל2000,
ולאחר מכן מבצעים קריאה בודדת עם אובייקט אופציות עם timeout של 3000, והוא גובר על ההגדרות הקודמות שהיו ברמה יותר גבוהה.

**שימו לב!** ניתן להגדיר את האופציות הבאות ברמת קריאה בודדת בלבד ולא ברמת שיחה/ראוטר:

- `val_name` (`read`)
- `prependToNextAction` (`id_list_message`)

# Events

ניתן להאזין לאירועים ברמת ראוטר על ידי האזנה ל`router.events`:

- `new_call` - כאשר שיחה חדשה נכנסת למערכת
- `call_continue` - התקבלה תשובה לקריאת read
- `call_hangup` - ‫כאשר שיחה מנותקת על ידי המחייג (התקבלה בקשה עם `hangup=yes`)

שימושי לדוגמה כדי לטפל בקריאות עם `hangup=yes` גם מחוץ לשלוחה.

# ניהול ערכים לכל שיחה

הספריה מספקת מנגנון לשמירת ערכים זמניים עבור כל שיחה בנפרד. הערכים נשמרים במהלך השיחה ומתאפסים אוטומטית בסיומה (ניתוק, יציאה מהשלוחה או שגיאה).

## פונקציות בסיסיות

### `setCallValue(callId, key, value)`

שמירת ערך עבור שיחה וkey ספציפי.

```js
import { setCallValue } from 'yemot-router2';

// בתוך הפונקציית השיחה
setCallValue(call.callId, 'userName', 'משה כהן');
setCallValue(call.callId, 'step', 1);
setCallValue(call.callId, 'preferences', { language: 'he', notifications: true });
```

### `getCallValue(callId, key)`

קבלת ערך שמור עבור שיחה וkey ספציפי.

```js
import { getCallValue } from 'yemot-router2';

const userName = getCallValue(call.callId, 'userName'); // 'משה כהן'
const step = getCallValue(call.callId, 'step'); // 1
const preferences = getCallValue(call.callId, 'preferences'); // { language: 'he', notifications: true }
```

### `hasCallValue(callId, key)`

בדיקה האם קיים ערך עבור שיחה וkey ספציפי.

```js
import { hasCallValue } from 'yemot-router2';

if (hasCallValue(call.callId, 'userName')) {
    // המשתמש כבר הזין את שמו
    const name = getCallValue(call.callId, 'userName');
    await call.read([{ type: 'text', data: `שלום ${name}` }], 'tap');
} else {
    // בקש מהמשתמש להזין שם
    const name = await call.read([{ type: 'text', data: 'אנא הזן את שמך' }], 'tap');
    setCallValue(call.callId, 'userName', name);
}
```

### `resetCallValue(callId, key)`

איפוס/הסרת ערך ספציפי עבור שיחה.

```js
import { resetCallValue } from 'yemot-router2';

resetCallValue(call.callId, 'temporaryData');
```

### `getAllCallValues(callId)`

קבלת כל הערכים השמורים עבור שיחה ספציפית.

```js
import { getAllCallValues } from 'yemot-router2';

const allValues = getAllCallValues(call.callId);
console.log('כל הנתונים של השיחה:', allValues);
// { userName: 'משה כהן', step: 1, preferences: { language: 'he', notifications: true } }
```

## פונקציות ניהול

### `clearCallValues(callId)`

הסרת כל הערכים השמורים עבור שיחה ספציפית.

```js
import { clearCallValues } from 'yemot-router2';

// מחיקה ידנית של כל הנתונים לשיחה
clearCallValues(call.callId);
```

### `clearAllCallValues()`

הסרת כל הערכים השמורים עבור כל השיחות.

```js
import { clearAllCallValues } from 'yemot-router2';

// ניקוי כללי של כל הנתונים (לדוגמה בעת restart של השרת)
clearAllCallValues();
```

### `getActiveCallsCount()`

קבלת מספר השיחות הפעילות עם ערכים שמורים.

```js
import { getActiveCallsCount } from 'yemot-router2';

const activeCallsCount = getActiveCallsCount();
console.log(`יש ${activeCallsCount} שיחות פעילות עם נתונים שמורים`);
```

### `getActiveCallIds()`

קבלת כל מזהי השיחות הפעילות.

```js
import { getActiveCallIds } from 'yemot-router2';

const callIds = getActiveCallIds();
console.log('שיחות פעילות:', callIds);
// ['abc123', 'def456', 'ghi789']
```

## תאימות לאחור - פונקציות טוקן

עבור תאימות לאחור, הספריה מספקת פונקציות ייעודיות לניהול טוקנים:

```js
import { 
    setCallToken, 
    getCallToken, 
    hasCallToken, 
    resetCallToken 
} from 'yemot-router2';

// זהה ל-setCallValue(callId, 'token', value)
setCallToken(call.callId, 'jwt-token-here');

// זהה ל-getCallValue(callId, 'token') 
const token = getCallToken(call.callId);

// זהה ל-hasCallValue(callId, 'token')
if (hasCallToken(call.callId)) {
    // יש טוקן
}

// זהה ל-resetCallValue(callId, 'token')
resetCallToken(call.callId);
```

## דוגמה מעשית - מערכת תפריטים מתקדמת

```js
import { YemotRouter, setCallValue, getCallValue, hasCallValue } from 'yemot-router2';

const router = YemotRouter({ printLog: true });

router.get('/', async (call) => {
    // בדיקה אם המשתמש כבר התחבר
    if (hasCallValue(call.callId, 'isAuthenticated')) {
        return await showMainMenu(call);
    }
    
    // תהליך התחברות
    const phone = call.phone;
    const pin = await call.read([
        { type: 'text', data: 'שלום, אנא הזן את הקוד האישי שלך' }
    ], 'tap', { max_digits: 4, min_digits: 4 });
    
    // בדיקת הקוד (לדוגמה)
    if (await validatePin(phone, pin)) {
        setCallValue(call.callId, 'isAuthenticated', true);
        setCallValue(call.callId, 'userPhone', phone);
        return await showMainMenu(call);
    } else {
        return call.id_list_message([
            { type: 'text', data: 'קוד שגוי' }
        ]);
    }
});

async function showMainMenu(call) {
    const userPhone = getCallValue(call.callId, 'userPhone');
    
    const choice = await call.read([
        { type: 'text', data: 'תפריט ראשי - הקש 1 לחשבון, 2 לתמיכה' }
    ], 'tap', { 
        max_digits: 1, 
        digits_allowed: [1, 2] 
    });
    
    setCallValue(call.callId, 'currentMenu', 'main');
    setCallValue(call.callId, 'lastChoice', choice);
    
    if (choice === '1') {
        return await showAccountMenu(call);
    } else if (choice === '2') {
        return await showSupportMenu(call);
    }
}

async function showAccountMenu(call) {
    setCallValue(call.callId, 'currentMenu', 'account');
    
    // תצוגת תפריט חשבון...
    const choice = await call.read([
        { type: 'text', data: 'הקש 1 ליתרה, 2 לעסקאות אחרונות, 9 לתפריט הקודם' }
    ], 'tap', { 
        max_digits: 1, 
        digits_allowed: [1, 2, 9] 
    });
    
    if (choice === '9') {
        return await showMainMenu(call);
    }
    
    // המשך הטיפול...
}

async function validatePin(phone, pin) {
    // כאן תהיה לוגיקת האימות האמיתית
    return pin === '1234';
}
```

## הערות חשובות

⚠️ **ניקוי אוטומטי**: הערכים מתאפסים אוטומטיות בכל מקרה של סיום שיחה:
- ניתוק על ידי המחייג
- יציאה מהשלוחה (`id_list_message`, `go_to_folder`)
- שגיאה שגורמת למחיקת השיחה
- timeout

⚠️ **זיכרון**: הערכים נשמרים בזיכרון השרת, לכן בעת restart של השרת כל הנתונים יאבדו.

⚠️ **ביצועים**: עבור מערכות עם מספר רב של שיחות במקביל, יש לשקול שימוש במנגנון TTL או ניקוי תקופתי.

# TypeScript

הערות לשימוש בספריה עם טייפסקריפט:

## ‏`app.use(router)`

בשימוש בראוטר עם אקספרס -
```ts
const router = YemotRouter()
app.use(router)
```
תוצג שגיאת טייפ. הפיתרון כרגע:
```ts
const { Router } = require('express')
const router = YemotRouter()
app.use(router.asExpressRouter)
```

## הגדרת ‏`empty_val` שאינו מסוג string

כרגע הDTS לא מוגדר להסיק את הטייפ אוטומטית, ויש להגדיר אותו ידנית עם `as`, דוגמה:
```ts
const res = await call.read([{ type: 'text', data: 'please type one' }], 'tap', {
    allow_empty: true,
    empty_val: null,
}) as string | null;
```

# נספח: מקרי קצה - למנוסים בשימוש בספריה

## הרצת קוד לאחר החזרת תשובה למחייג

**⚠️ שימו לב - קטע זה מורכב מעט להבנה, ונצרך רק אם מעוניינים להחזיר תשובה למחייב ולתת לו לצאת מהשלוחה (`id_list_message`), ולאחר מכן להריץ קוד "כבד", ולא נצרכת אם נותנים למאזין להמתין לאישור ביצוע הפעולה (באמצעות `read`).**

בעת החזרת תשובה שאינה `read` ולא גורמת לשרת של ימות לחזור לראוטר - `id_list_message` או `go_to_folder`,
נזרקת שגיאה על ידי הספריה - שתופסת אותה בחזרה ברמה יותר גבוהה, וכך ריצת הפונקציה נהרגת כדי לחסוך בזיכרון
וכן לנקות את השיחה מה`activeCalls` - כדי שבכניסה חוזרת לשלוחה הפונקציה תרוץ מההתחלה ולא תמשיך.

לכן אם מנסים להחזיר תשובה למשתמש ולאחר מכן להריץ את הקוד ה"כבד" כמו שעושים בשרת nodejs + express רגיל, לדוגמה:

```js
function runBigJob(req, res) {
    res.status(202).send('ok, we got your request, we will send you an email when the job is done')
    doBigJob()
}
```

או במקרה של הראוטר - קוד (**שגוי**) כזה:

```js
async function runBigJob(call) {
    call.id_list_message([{
        type: 'text',
        data: 'בסדר, בקשתך תטופל בהקדם'
    }])
    await doBigJob()
}
```

קוד כזה לא יעבוד כיוון שהקריאה ל`call.id_list_messsage` זורקת שגיאה שהורגת את ריצת הפונקציה, ולכן הקוד שלאחריה לא ירוץ.

כדי להריץ קוד לאחר החזרת התשובה, יש לתפוס את השגיאה שנזרקת (במקרה שהיא שגיאת `ExitError` פנימית כנ"ל):

```js
import { ExitError } from 'yemot-router2';
async function runBigJob (call) {
    try {
        call.id_list_message([{
            type: 'text',
            data: 'בסדר, בקשתך תטופל בהקדם'
        }]);
    } catch (error) {
        if (error.isExitError) return;
        throw error;
    };
    await doBigJob();
}
```

### מחיקה ידנית של השיחה מה`activeCalls`

אין צורך לזרוק ידנית את `ExitError` כדי למחוק את השיחה מהactiveCalls, כיוון שהיא נמחקת אוטומטית על ידי הספריה בסיום הריצה של הפונקציה.<br>
עם זאת, באם הקוד הנוסף המורץ אמור לקחת זמן, מומלץ לנקות ידנית באופן מיידי (מייד לאחר החזרת התשובה ב`id_list_message`) את השיחה מהactiveCalls - אחרת לא יהיה ניתן להיכנס לשלוחה עד לסיום ביצוע הפעולה הכבדה:

```js
const router = YemotRouter({ printLog: true });
router.get('/', async (call) => {
    try {
        call.id_list_message([{
            type: 'text',
            data: 'בסדר, בקשתך תטופל בהקדם'
        }]);
    } catch (error) {
        if (error.isExitError) return;
        throw error;
    };
    router.deleteCall(call.callId);
    await doBigJob();
});
```

## דרך נוספת להרצת קוד כבד

אופציה נוספת היא להריץ את הקוד בצורה מנותקת מהפונקציה, כלומר קריאה לקוד ה"כבד" בתוך פונקצייה אנונימית **לפני** החזרת התשובה:

```js
(() => {
    await doBigJob();
})();
call.id_list_message(...);
```
