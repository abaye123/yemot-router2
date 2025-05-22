import { type EventEmitter } from 'events';
import { type Router, type Request, type Response } from 'express';
export { SYSTEM_MESSAGE_CODES, SystemMessageCode } from './system-messages'
import { SystemMessageCode } from './system-messages';

/**
* הגדרות למיקום וזמן עבור סוג הודעה 'zmanim'
*/
export interface ZmanimData {
   time?: string;
   zone?: string;
   difference?: string;
}

/**
* הגדרות למוזיקה בהמתנה עבור סוג הודעה 'music_on_hold'
*/
export interface MusicOnHoldData {
   musicName: string;
   maxSec?: number;
}

/**
* מייצג "הודעה" הניתנת להשמעה ב‫`read`/`id_list_message`
*/
export type Msg =
   | ({ type: 'file'; data: string; removeInvalidChars?: boolean })
   | ({ type: 'text'; data: string; removeInvalidChars?: boolean })
   | ({ type: 'speech'; data: string; removeInvalidChars?: boolean })
   | ({ type: 'digits'; data: number | string; removeInvalidChars?: boolean })
   | ({ type: 'number'; data: number | string; removeInvalidChars?: boolean })
   | ({ type: 'alpha'; data: string; removeInvalidChars?: boolean })
   | ({ type: 'zmanim'; data: ZmanimData; removeInvalidChars?: boolean })
   | ({ type: 'go_to_folder'; data: string; removeInvalidChars?: boolean })
   | ({ type: 'system_message'; data: SystemMessageCode; removeInvalidChars?: boolean })
   | ({ type: 'music_on_hold'; data: MusicOnHoldData; removeInvalidChars?: boolean })
   | ({ type: 'date'; data: string; removeInvalidChars?: boolean })
   | ({ type: 'dateH'; data: string; removeInvalidChars?: boolean });
   
interface Defaults {
    /**
     * האם להדפיס לוג מפורט על כל קריאה לשרת, שיחה חדשה, ניתוק ועוד. שימושי לפיתוח ודיבוג<br>
     * @see [router.events](https://github.com/ShlomoCode/yemot-router2#events) - קבלת קאלבק על שיחה חדשה/קבלת נתון ממאזין/ניתוק שיחה, למשתמשים מתקדמים. לא תלוי בהגדרה זו
     * @default false
     */
    printLog?: boolean
    /**
     * האם להסיר אוטומטית תווים לא חוקיים (`.`,`-`,`'`,`"`,`&`) מתשובות הקראת טקסט<br>
     * ,באם לא מוגדרת הסרה (ברירת מחדל), תיזרק שגיאה<br>
     * באם מוגדרת הסרה ‫(`true`) התווים יוסרו מהתשובה שתוחזר לימות ולא תיזרק שגיאה<br>
     * ניתן להגדיר ערך זה ב3 רמות, ראו [תיעוד מלא](https://github.com/ShlomoCode/yemot-router2#%D7%AA%D7%95%D7%95%D7%99%D7%9D-%D7%9C%D7%90-%D7%97%D7%95%D7%A7%D7%99%D7%99%D7%9D-%D7%91%D7%94%D7%A7%D7%A8%D7%90%D7%AA-%D7%98%D7%A7%D7%A1%D7%98)
     * @default false
     */
    removeInvalidChars?: boolean
    read?: {
        /**
         * ‫ זמן המתנה לקבלת נתון מהמשתמש (במילישניות). במידה ולא התקבל הנתון בזמן הנ"ל, השיחה תימחק מה`activeCalls` וגם אם המשתמש יקיש השרת יקבל אותו כשיחה חדשה<br>
         * ‫מקבל מספר מילישיניות, או מחרוזת הקבילה ע"י ספריית [ספריית ms](https://npmjs.com/ms).<br>
         * ‫מכסה גם מקרי קצה שלא התקבלה מימות אות ניתוק (קריאה עם `hangup=yes` בפרטרים)<br>
         * 
         * ‫יש לשים לב לא להגדיר ערך נמוך שמחייג לגיטימי שלא הקיש מיד תשובה עלול להיתקל ב-timeout<br>
         * 
         * ברירת מחדל: אין ‫timeout
         */
        timeout?: number
        tap?: TapOptions
        stt?: SstOptions
        record?: RecordOptions
    }
    id_list_message?: IdListMessageOptions
}

// from @types/express - https://github.com/DefinitelyTyped/DefinitelyTyped/blob/f800de4ffd291820a9e444e6b6cd3ac9b4a16e53/types/express/index.d.ts#L73-#L92
interface ExpressRouterOptions {
    /**
     * Enable case sensitivity.
     */
    caseSensitive?: boolean | undefined

    /**
     * Preserve the req.params values from the parent router.
     * If the parent and the child have conflicting param names, the child's value take precedence.
     *
     * @default false
     * @since 4.5.0
     */
    mergeParams?: boolean | undefined

    /**
     * Enable strict routing.
     */
    strict?: boolean | undefined
}

type YemotRouterOptions = ExpressRouterOptions & {
    /**
     * ‫ זמן המתנה לקבלת נתון מהמשתמש (במילישניות). במידה ולא התקבל הנתון בזמן הנ"ל, השיחה תימחק מה`activeCalls` וגם אם המשתמש יקיש השרת יקבל אותו כשיחה חדשה<br>
     * ‫מקבל מספר מילישיניות, או מחרוזת הקבילה ע"י ספריית [ספריית ms](https://npmjs.com/ms).<br>
     * ‫מכסה גם מקרי קצה שלא התקבלה מימות אות ניתוק (קריאה עם `hangup=yes` בפרטרים)<br>
     * 
     * ‫יש לשים לב לא להגדיר ערך נמוך שמחייג לגיטימי שלא הקיש מיד תשובה עלול להיתקל ב-timeout<br>
     * 
     * ברירת מחדל: אין ‫timeout
     */
    timeout?: number
    /**
     * האם להדפיס לוג מפורט על כל קריאה לשרת, שיחה חדשה, ניתוק ועוד. שימושי לפיתוח ודיבוג<br>
     * @see [router.events](https://github.com/ShlomoCode/yemot-router2#events) - קבלת קאלבק על שיחה חדשה/קבלת נתון ממאזין/ניתוק שיחה, למשתמשים מתקדמים. לא תלוי בהגדרה זו
     * @default false
     */
    printLog?: boolean
    /**
     * הגדרת קאלבק לטיפול בשגיאות בתוך שיחה, שימושי לדוגמה לשמירת לוג + השמעת הודעה למשתמש, במקום קריסה של השרת (והמשתמש ישמע "אין מענה משרת ‫API")<br>
     * ראה דוגמה ב‫[example.js](https://github.com/ShlomoCode/yemot-router2/blob/master/example.js)
     */
    uncaughtErrorHandler?: (error: Error, call: Call) => void | Promise<unknown>
    defaults?: Defaults
};

type CallHandler = (call: Call) => Promise<unknown>;

interface RouterEventEmitter extends EventEmitter {
    on: (eventName: 'call_hangup' | 'call_continue' | 'new_call', listener: (call: Call) => void) => this
    once: (eventName: 'call_hangup' | 'call_continue' | 'new_call', listener: (call: Call) => void) => this
}

export function YemotRouter (options?: YemotRouterOptions): {
    /**
     * הוספת הנלדר לשיחות (במתודת ‫`GET` בלבד)
     */
    get: (path: string, handler: CallHandler) => void
    /**
     * הוספת הנלדר לשיחות (במתודת ‫`POST` בלבד - ‫`api_url_post=yes`)
     */
    post: (path: string, handler: CallHandler) => void
    /**
     * הוספת הנלדר לשיחות במתודת ‫`GET` וגם במתודת ‫`POST`
     */
    all: (path: string, handler: CallHandler) => void
    use: Router['use']
    /**
     * delete call from active calls by callId
     * @returns true if the call was deleted, false if the call was not found
     */
    deleteCall: (callId: string) => boolean
    events: RouterEventEmitter
    defaults: Defaults
    /**
     * מתודה לשימוש בטייפסקריפט בלבד
     * ---------------
     * מחזיר את הראוטר ‫(`YemotRouter`) כפי שהוא - עם טייפ של ‫`Express.Router`, למניעת שגיאת טייפ
     * @example ```ts
     * import express from 'express';
     * import { YemotRouter } from 'yemot-router';
     *  
     * const app = express();
     * const router = YemotRouter();
     * 
     * app.use(router.asExpressRouter); // 👈👈👈
     * ```
     */
    asExpressRouter: Router
};

// based of https://tchumim.com/post/157692, https://tchumim.com/post/157706
interface ReadModes {
    tap: TapOptions
    stt: SstOptions
    record: RecordOptions
}

/**
 * מייצג "שיחה", עליה ניתן להפעיל מתודות שונות כמו ‫`read`, `id_list_message`, `go_to_folder` וכו'
 */
export interface Call {
    /**
     * מתודה לקבלת נתון מהמחייג, מחזירה ‫`Promise` שנפתר עם סטרינג עם התשובה (במקרה של בקשת הקלטה, יחזור נתיב הקובץ)<br>
     * [פירוט נוסף על ‫read בתיעוד ימות המשיח](https://f2.freeivr.co.il/post/78283)
     * @param messages מערך ההודעות שיושמעו למשתמש לפני קבלת הנתון
     * @param mode סוג הנתון שמבקשים מהמחייג<br>
     * `tap` = הקשות<br>
     * `stt` = זיהוי דיבור<br>
     * `record` = הקלטה
     * @param options אפשרויות נוספות לפי סוג הנתון - לדוגמה ספרות מותרות להקשה, מקסימום ספרות, וכולי
     */
    read: <T extends keyof ReadModes>(messages: Msg[], mode: T, options?: ReadModes[T]) => Promise<string>
    /**
     * מתודה להעברת השיחה לשלוחה מסוימת במערכת הנוכחית
     * @param target נתיב למעבר, יחסי לשלוחה הנוכחית, יחסי לשלוחה הראשית (מתחיל ב`/`). [פירוט של האופציות הזמינות](https://f2.freeivr.co.il/post/58)
     * @see {@link hangup|`call.hangup()`} - קיצור לנוחות של ‫`go_to_folder('hangup')`
     */
    go_to_folder: (target: string) => void
    /**
     * השמעת הודעה אחת או יותר<br>
     * <hr>
     * 
     * ⚠️ שים לב! ⚠️<br>
     * לאחר השמעת ההודעות, השיחה תצא אוטומטית מהשלוחה!
     * באם מעוניינים לשרשר פעולה נוספת לאחר ההשמעה, לדוגמה להשמיע הודעה ואז לבצע ‫`read` (קבלת נתונים נוספים), יש להגדיר בארגומנט ה‫`options` את ‫`prependToNextAction` ל‫`true`
     * @param messages 
     * @param options 
     * @example  השמעת הודעה ויציאה מהשלוחה
     * ```js
     * call.id_list_message([{ type: 'text', data: 'הודעה לדוגמה' }]);
     * ```
     * @example השמעת הודעה והמשך לפעולה הבאה - לדוגמה ‫`read`
     * ```js
     * call.id_list_message([{ type: 'text', data: 'הודעה לדוגמה' }], { prependToNextAction: true });
     * const res = await call.read([{ type: 'text', data: 'הקש משהו' }], 'tap');
     * ```
     */
    id_list_message: (messages: Msg[], options?: IdListMessageOptions) => void
    /**
     * מתודה להעברת השיחה למערכת אחרת בימות המשיח ללא עלות יחידות, באמצעות ‫"ראוטינג ימות"<br>
     * הפונקציה מקבלת ארגומנט יחיד - סטרינג של מספר מערכת בימות להעברת השיחה אליה<br>
     */
    routing_yemot: (number: string) => void
    /**
     * הפעלה מחדש של השלוחה הנוכחית<br>
     * <hr>
     * 
     * ‫קיצור לתחביר הבא:
     * ```js
     * call.go_to_folder(`/${call.ApiExtension}`);
     * ```
     */
    restart_ext: () => void
    /**
     * ניתוק השיחה. קיצור לתחביר הבא‫:
     * ```js
     * call.go_to_folder('hangup');
     * ```
     */
    hangup: () => void
    blockRunningUntilNextRequest: () => Promise<void>
    /**
     * ניתן להשתמש במתודה זו כדי לשלוח סטרינג חופשי לחלוטין, לדוגמה עבור פונקציונליות שעדיין לא נתמכת בספרייה<br>
     * במתודה זו יש להעביר את הסטרינג בדיוק כפי שמעוניינים שהשרת של ימות יקבל אותו, והוא לא עובר אף ולידציה או עיבוד<br>
     * 
     * :כדי להשתמש לבקשת מידע - לדוגמה מעבר לסליקת אשראי, יש לשלב עם קריאות ל
     * ```
     * await call.blockRunningUntilNextRequest();
     * ```
     */
    send: (resp: string) => Response<string>
    /**
     * מכיל את כל הפרמטרים שנשלחו מימות<br>
     * אם הבקשה נשלחה ב-‫`HTTP GET`, יכיל את ה‫`query string`<br>
     * אם הבקשה נשלחה ב-‫`HTTP POST` (‫`api_url_post=yes`), יכיל את ה‫`body`
     */
    values: Readonly<Record<string, string>>
    /**
     * ברירות מחדל - ברמת שיחה (דורס את הברירות מחדל ברמת ראוטר)
     */
    defaults: Defaults
    req: Request
    /**
     * מספר הטלפון **הראשי** של המערכת<br>
     * קיצור של ‫{@link ApiDID|`call.ApiDID`}
     */
    did: string
    /**
     * מספר הטלפון של המחייג<br>
     * קיצור של ‫{@link ApiPhone|`call.ApiPhone`}
     */
    phone: string
    /**
     * המספר אליו חייג המשתמש<br>
     * במידה ויש כמה מספרים למערכת שלכם, והלקוח צלצל למספר משנה, הערך הזה יהיה שונה מהערך הקודם<br>
     * קיצור של ‫{@link ApiRealDID|`call.ApiRealDID`}
     */
    real_did: string
    /**
     * מזהה ייחודי לאורך השיחה<br>
     * קיצור של ‫{@link ApiCallId|`call.ApiCallId`}
     */
    callId: string
    /**
     * שם התיקייה/שלוחה בה נמצא המשתמש<br>
     * קיצור של ‫{@link ApiExtension|`call.ApiExtension`}
     * @example "9" - שלוחה 9 בתפריט הראשי
     * @example "" - שלוחה ראשית
     */
    extension: string
    /**
     * מזהה ייחודי לאורך השיחה
     * <hr>
     * @see {@link callId|`call.callId`} (קיצור לנוחות)
     */
    ApiCallId: string
    /**
     * מספר הטלפון של המחייג
     * <hr>
     * @see {@link phone|`call.phone`} (קיצור לנוחות)
     */
    ApiPhone: string
    /**
     * מספר הטלפון **הראשי** של המערכת
     * <hr>
     * @see {@link did|`call.did`} (קיצור לנוחות)
     */
    ApiDID: string
    /**
     * המספר אליו חייג המשתמש<br>
     * במידה ויש כמה מספרים למערכת והלקוח חייג למספר משנה, הערך הזה יהיה שונה מ ‫{@link ApiDID|`call.ApiDID`}
     * <hr>
     * @see {@link real_did|`call.real_did`} (קיצור לנוחות)
     */
    ApiRealDID: string
    /**
     * שם התיקייה/שלוחה בה נמצא המשתמש
     * <hr>
     * @see {@link extension|`call.extension`} (קיצור לנוחות)
     * @example "9" - שלוחה 9 בתפריט הראשי
     * @example "" - שלוחה ראשית
    */
    ApiExtension: string
    /**
     * במידה ובוצעה התחברות לפי זיהוי אישי, יצורף ערך זה המכיל את סוג ההתחברות וה-ID של המשתמש (מידע נוסף [כאן](https://f2.freeivr.co.il/post/1250))
     */
    ApiEnterID: string
    /**
     * שם משויך לזיהוי האישי (כפי שמוסבר בערך של `login_add_val_name=yes` [כאן](https://f2.freeivr.co.il/post/2015))
     */
    ApiEnterIDName: string
    /**
     * זמן בשניות מ1970, Epoch, i.e., since 1970-01-01 00:00:00 UTC
     * @example "1683594518"
     */
    ApiTime: string
    /**
     * זהה ל`callId` של הcalls בAPI `GetCallsStatus`
     */
    ApiYFCallId: string
}

/**
 * מייצג "הודעה" הניתנת להשמעה ב‫`read`/`id_list_message`
 */
export interface Msg {
    type: 'file' | 'text' | 'speech' | 'digits' | 'number' | 'alpha' | 'zmanim' | 'go_to_folder' | 'system_message' | 'music_on_hold' | 'date' | 'dateH'
    data: string | number | SystemMessageCode | { time?: string, zone?: string, difference?: string } | { musicName: string, maxSec?: number }
     /**
     * האם להסיר אוטומטית תווים לא חוקיים (`.`,`-`,`'`,`"`,`&`) מתשובות הקראת טקסט<br>
     * ,באם לא מוגדרת הסרה (ברירת מחדל), תיזרק שגיאה<br>
     * באם מוגדרת הסרה ‫(`true`) התווים יוסרו מהתשובה שתוחזר לימות ולא תיזרק שגיאה<br>
     * ניתן להגדיר ערך זה ב3 רמות, ראו [תיעוד מלא](https://github.com/ShlomoCode/yemot-router2#%D7%AA%D7%95%D7%95%D7%99%D7%9D-%D7%9C%D7%90-%D7%97%D7%95%D7%A7%D7%99%D7%99%D7%9D-%D7%91%D7%94%D7%A7%D7%A8%D7%90%D7%AA-%D7%98%D7%A7%D7%A1%D7%98)
     * @default false
     */
    removeInvalidChars?: boolean
}

interface GeneralReadOptions {
    /**
     * שם‫ הפרמטר בURL שבו יצורף הערך שהמשתמש הקיש<br>
     * ברירת מחדל - נקבע אוטומטית: ‫`val_1`, `val_2`, `val_3` וכו' בסדר עולה
     */
    val_name?: string
    /**
     * האם לבקש את הערך שוב אם הפרמטר בשם שנבחר ‫({@link GeneralReadOptions.val_name|`val_name`}) כבר קיים ‫בURL<br>
     * ברירת מחדל - המערכת תבקש מחדש, במידה ומוגדר ‫`true` בערך זה, המערכת תשתמש בערך הקודם שהוקש ותשלח אותו בתור תשובה
     */
    re_enter_if_exists?: boolean
    /**
     * האם להסיר אוטומטית תווים לא חוקיים (`.`,`-`,`'`,`"`,`&`) מתשובות הקראת טקסט<br>
     * ,באם לא מוגדרת הסרה (ברירת מחדל), תיזרק שגיאה<br>
     * באם מוגדרת הסרה ‫(`true`) התווים יוסרו מהתשובה שתוחזר לימות ולא תיזרק שגיאה<br>
     * ניתן להגדיר ערך זה ב3 רמות, ראו [תיעוד מלא](https://github.com/ShlomoCode/yemot-router2#%D7%AA%D7%95%D7%95%D7%99%D7%9D-%D7%9C%D7%90-%D7%97%D7%95%D7%A7%D7%99%D7%99%D7%9D-%D7%91%D7%94%D7%A7%D7%A8%D7%90%D7%AA-%D7%98%D7%A7%D7%A1%D7%98)
     * @default false
     */
    removeInvalidChars?: boolean
}

export interface TapOptions extends GeneralReadOptions {
    /**
     * כמות הספרות המקסימלית שהמשתמש יוכל להקיש<br>
     * ברירת מחדל ללא הגבלה
     */
    max_digits?: number
    /**
     * כמות ספרות מינימלית<br>
     * ברירת מחדל: 1
     * @default 1
     */
    min_digits?: number
    /**
     * זמן המתנה להקשה בשניות<br>
     * ברירת מחדל: 7 שניות
     * @default 7
     */
    sec_wait?: number
    /**
     * צורת ההשמעה למשתמש את הקשותיו<br>
     * באם מעוניינים במקלדת שונה ממקלדת ספרות, כגון ‫`EmailKeyboard` או ‫`HebrewKeyboard`, יש להכניס כאן את סוג המקלדת [ראו example.js]<br>
     * פירוט על כל אופציה ניתן למצוא בתיעוד מודול API של ימות המשיח, תחת"הערך השישי (הקשה)".
     * @default "No"
     */
    typing_playback_mode?: 'Number' | 'Digits' | 'File' | 'TTS' | 'Alpha' | 'No' | 'HebrewKeyboard' | 'EmailKeyboard' | 'EnglishKeyboard' | 'DigitsKeyboard' | 'TeudatZehut' | 'Price' | 'Time' | 'Phone' | 'No'
    /**
     * האם לחסום מקש כוכבית
     * @default false
     */
    block_asterisk_key?: boolean
    /**
     * האם לחסום מקש אפס
     * @default false
     */
    block_zero_key?: boolean
    /**
     * החלפת תווים
     * החלפת מקש בכל סימן אחר<br>
     * לדוגמה במידה ואתם רוצים שישלח כתובת ספריה כאשר המפריד בין התיקיות הוא סלש ‫(/)<br>
     * בטלפון לא ניתן להקיש סלש, אבל ניתן לבקש מהלקוח להקיש כוכבית בין תיקייה לתיקייה, ולסמן להחליף את הכוכבית בסלש<br>
     * ערך זה יכול להכיל 2 סימנים: הסימן הראשון את איזה ערך להחליף, הסימן השני זה מה לשים במקום מה שהוחלף<br>
     * @example "*@""
     * כלומר להחליף את מקש כוכבית בסלש
     */
    replace_char?: string
    /**
     *  איזה מקשים המשתמש יוכל להקיש<br>
     * באם המשתמש יקיש מקש שלא הוגדר המערכת תודיע ‫‫`M1224` "בחירה לא חוקית"<br>
     * 
     * ברירת מחדל: המשתמש יכול להקיש על כל המקשים<br>
     * @example [1, 2, '3', '*']
     * @example [10, 20, 30, 40]
     */
    digits_allowed?: Array<number | string>
    /** 
     * ברירת מחדל במידה והמשתמש לא הקיש כלום ועבר הזמן שהוגדר להקשה ‫({@link TapOptions.sec_wait}) הנתון שהמערכת קולטת הוא ריק<br>
     * כמות הפעמים שהמערכת משמיעה את השאלה לפני שהיא מגדירה את הנתון כ"ריק" היא פעם אחת
     * בערך זה ניתן להגדיר כמות פעמים שונה
     * @see {@link TapOptions.allow_empty}
     * @default 1
     */
    amount_attempts?: number
    /**
     * ברירת מחדל, במידה והנתון שהתקבל הוא "ריק" (ראה {@link TapOptions.amount_attempts}) המערכת משמיעה `M1002` "לא הוקשה בחירה" והמשתמש עובר להקשה מחודשת של הנתון
     * ניתן להגדיר שאם הנתון ריק המערכת תתקדם הלאה
     * @default false
     * @see {@link TapOptions.empty_val}
     */
    allow_empty?: boolean
    /**
     * הערך שיישלח כשלא הוקשה תשובה. ברירת מחדל: ‫`"None"`<br>
     * ניתן להעביר גם ערכים שאינם מחרוזת, לדוגמה ‫`null` והערך שיתקבל מה‫read יהיה ‫`null` ולא ‫`"null"`
     * <hr>
     * 
     * :למשתמשי טייפסקריפט בלבד
     * ---------------
     * כאשר מגדירים ‫`empty_val` שאינו מסוג ‫`string`, כרגע ‫ה‫DTS לא מוגדר להסיק את הטייפ אוטומטית, ויש להגדיר אותו ידנית עם ‫`as`, דוגמה:
     * ```ts
     * const res = await call.read([{ type: 'text', data: 'please type one' }], 'tap', {
     *     allow_empty: true,
     *     empty_val: null,
     * }) as string | null;
     * ```
     * <hr>
     * @default "None"
     */
    empty_val?: any
    /**
     * האם לחסום שינוי מצב הקלדה<br>
     * באם הוגדר ב‫{@link typing_playback_mode} מצב מקלדת,
     * ברירת מחדל המשתמש יכול בתפריט סיום או ביטול (במקש כוכבית) לשנות את סוג המקלדת.<br>
     * באם הגדרה זו מופעלת, אם המשתמש מנסה לשנות שפה האופציה תיחסם, והמערכת תשמיע ‫`M4186` "שינוי שפת הקלדה חסום בכתיבה זו"
     * @default false
     */
    block_change_keyboard?: boolean
}

export interface SstOptions extends GeneralReadOptions {
    /**
     * שפה לזיהוי הדיבור<br>
     * ברירת מחדל: עברית (או מה שהוגדר בערך ‫`lang` בשלוחה)<br>
     * [רשימת השפות הנתמכות](https://drive.google.com/file/d/1UC_KOjhZgPWZff8BcUfBLwMbSmKewy8A/view)
     */
    lang?: string
    /**
     * שלא יהיה ניתן להקיש במקום לדבר<br>
     * (ברירת המחדל היא שהמשתמש יכול או לדבר או להקיש)
     * @default false
     */
    block_typing?: boolean
    /**
     * כמות הספרות המקסימלית שהמשתמש יוכל להקיש<br>
     * ברירת מחדל: אין הגבלה
     */
    max_digits?: number
    /**
     * האם להשתמש במנוע זיהוי דיבור של הקלטות (תומך בזיהוי ארוך, אך לא מאפשר או הקשה או דיבור)<br>
     * @default false
     */
    use_records_recognition_engine?: boolean
    /**
     * אחרי כמה שניות של שקט לסיים את ההקלטה (ברירת מחדל - לא מפסיק)<br>
     * רלוונטי רק אם משתמשים במנוע זיהוי טקסטים ארוכים ‫({@link use_records_recognition_engine})
    */
   quiet_max?: number
    /**
    * מספר שניות מרבי להקלטה (ברירת מחדל: ללא הגבלה)
    */
    length_max?: number
}

export interface RecordOptions extends GeneralReadOptions {
    /**
     * (היכן תישמר ההקלטה במערכת (נתיב לתקיה, שם הקובץ מוגדר בנפרד<br>
     * 
     * ברירת מחדל - נשמרת בתיקייה שמוגדרת ב ‫`api_dir` בשלוחה (כלומר תקייה נוכחית בברירת מחדל)<br>
     * ניתן להגדיר מיקום שונה, לדוגמה ‫`8/` = שלוחה 8 בתפריט הראשי<br>
     * הערה: חובה לשים `/` בהתחלה, אסור לשים `/` בסוף
     */
    path?: string
    /**
     * שם הקובץ שיישמר (**ללא סיומת**)<br>
     * ברירת מחדל - מיספור אוטומטי כקובץ הגבוה בשלוחה<br>
     * לדוגמה אם הקובץ הכי גבוה בשלוחה היה 100, הקובץ החדש יהיה 101
     */
    file_name?: string
    /**
     * האם לשמור את הקובץ בסיום ישירות, ללא תפריט שמיעת ההקלטה/אישור/הקלטה מחדש/המשך הקלטה
     * @default false
     */
    no_confirm_menu?: boolean
    /**
     * @default true
     * האם לשמור את ההקלטה לקובץ אם המשתמש ניתק באמצע ההקלטה
     */
    save_on_hangup?: boolean
    /**
     * במידה והוגדר שם קובץ לשמירה (file_name) וכבר קיים קובץ בשם שנבחר<br>
     * האם לשנות את שם הקובץ הישן ולשמור את החדש בשם שנבחר (ברירת מחדל)<br>
     * או לצרף את ההקלטה החדשה לסוף הקובץ הישן
     * @default false 
     */
    append_to_existing_file?: boolean
    /**
     * (כמות שניות מינימלית להקלטה (ברירת מחדל: אין מינימום
     */
    min_length?: number
    /**
     * (כמות שניות מקסימלית להקלטה (ברירת מחדל: אין מקסימום
     */
    max_length?: number
}

interface IdListMessageOptions {
    /**
     * האם להסיר אוטומטית תווים לא חוקיים (`.`,`-`,`'`,`"`,`&`) מתשובות הקראת טקסט<br>
     * ,באם לא מוגדרת הסרה (ברירת מחדל), תיזרק שגיאה<br>
     * באם מוגדרת הסרה ‫(`true`) התווים יוסרו מהתשובה שתוחזר לימות ולא תיזרק שגיאה<br>
     * ניתן להגדיר ערך זה ב3 רמות, ראו [תיעוד מלא](https://github.com/ShlomoCode/yemot-router2#%D7%AA%D7%95%D7%95%D7%99%D7%9D-%D7%9C%D7%90-%D7%97%D7%95%D7%A7%D7%99%D7%99%D7%9D-%D7%91%D7%94%D7%A7%D7%A8%D7%90%D7%AA-%D7%98%D7%A7%D7%A1%D7%98)
     * @default false
     */
    removeInvalidChars?: boolean
    /**
     * יש להגדיר במידה ומעוניינים לשרשר פעולות נוספות (לדוגמה read)
     * @default: false
     */
    prependToNextAction?: boolean
}

export class CallError extends Error {
    readonly date: Date;
    readonly call: Call;

    constructor (options: { message: string, call: Call });
}

export class ExitError extends CallError {
    readonly context: {
        caller: 'go_to_folder' | 'id_list_message' | 'routing_yemot'
        target: string
    };

    constructor (call: Call, context: ExitError['context']);
}

export class HangupError extends CallError {
    constructor (call: Call);
}

export class TimeoutError extends CallError {
    readonly timeout: number;

    constructor (call: Call, timeout: number);
}

// =========== Call Values Management Functions ===========

/**
 * פונקציות לניהול ערכים שמורים לכל שיחה
 * מאפשרות לשמור נתונים זמניים שמתאפסים אוטומטית בסיום השיחה
 */

/**
 * שמירת ערך עבור שיחה וkey ספציפי
 * @param callId מזהה השיחה
 * @param key המפתח לשמירת הערך
 * @param value הערך לשמירה
 * @returns האם הפעולה הצליחה
 */
export function setCallValue(callId: string, key: string, value: any): boolean;

/**
 * איפוס/הסרת ערך ספציפי עבור שיחה
 * @param callId מזהה השיחה 
 * @param key המפתח לאיפוס
 * @returns האם הפעולה הצליחה
 */
export function resetCallValue(callId: string, key: string): boolean;

/**
 * קבלת ערך עבור שיחה וkey ספציפי
 * @param callId מזהה השיחה
 * @param key המפתח לקבלת הערך
 * @returns הערך השמור או null אם לא נמצא
 */
export function getCallValue(callId: string, key: string): any | null;

/**
 * בדיקה האם קיים ערך עבור שיחה וkey ספציפי
 * @param callId מזהה השיחה
 * @param key המפתח לבדיקה
 * @returns האם קיים ערך
 */
export function hasCallValue(callId: string, key: string): boolean;

/**
 * קבלת כל הערכים השמורים עבור שיחה ספציפית
 * @param callId מזהה השיחה
 * @returns כל הערכים השמורים או null אם לא נמצאו
 */
export function getAllCallValues(callId: string): Record<string, any> | null;

/**
 * הסרת כל הערכים השמורים עבור שיחה ספציפית
 * @param callId מזהה השיחה להסרה
 * @returns האם הפעולה הצליחה
 */
export function clearCallValues(callId: string): boolean;

/**
 * הסרת כל הערכים השמורים עבור כל השיחות
 * @returns האם הפעולה הצליחה
 */
export function clearAllCallValues(): boolean;

/**
 * קבלת מספר השיחות הפעילות עם ערכים שמורים
 * @returns מספר השיחות הפעילות
 */
export function getActiveCallsCount(): number;

/**
 * קבלת כל מזהי השיחות הפעילות
 * @returns מערך של מזהי שיחות
 */
export function getActiveCallIds(): string[];

/**
 * ניקוי ערכים שפג תוקפם (placeholder לעתיד)
 * @param maxAge גיל מקסימלי במילישניות
 * @returns מספר השיחות שנוקו
 */
export function cleanupExpiredValues(maxAge: number): number;

// =========== Backward Compatibility for Token Functions ===========

/**
 * שמירת טוקן עבור שיחה (תאימות לאחור)
 * @param callId מזהה השיחה
 * @param value ערך הטוקן
 * @returns האם הפעולה הצליחה
 * @deprecated השתמש ב-setCallValue(callId, 'token', value) במקום
 */
export function setCallToken(callId: string, value: any): boolean;

/**
 * איפוס טוקן עבור שיחה (תאימות לאחור)
 * @param callId מזהה השיחה
 * @returns האם הפעולה הצליחה
 * @deprecated השתמש ב-resetCallValue(callId, 'token') במקום
 */
export function resetCallToken(callId: string): boolean;

/**
 * קבלת טוקן עבור שיחה (תאימות לאחור)
 * @param callId מזהה השיחה
 * @returns הטוקן השמור או null אם לא נמצא
 * @deprecated השתמש ב-getCallValue(callId, 'token') במקום
 */
export function getCallToken(callId: string): any | null;

/**
 * בדיקה האם קיים טוקן עבור שיחה (תאימות לאחור)
 * @param callId מזהה השיחה
 * @returns האם קיים טוקן
 * @deprecated השתמש ב-hasCallValue(callId, 'token') במקום
 */
export function hasCallToken(callId: string): boolean;