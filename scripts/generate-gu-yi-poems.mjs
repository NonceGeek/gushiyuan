/**
 * One-time generator for 古逸卷 (《古诗源》卷一) poem markdown files.
 * Source text aligned with中华书局点校本体例；正文繁体，一行一句。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const POEMS_DIR = path.join(ROOT, "content", "poems");
const MANIFEST_PATH = path.join(ROOT, "content", "volumes", "gu-yi-manifest.json");

const BASE = "《古詩源·卷一》沈德潛 中華書局點校本";
const DYNASTY = "古逸";
const VOLUME = "gu-yi";

/** @type {Array<{slug:string,title:string,author:string,authorSlug:string,lines:string[]}>} */
const POEMS = [
  { slug: "ji-rang-ge", title: "擊壤歌", author: "堯時民歌", authorSlug: "yao-shi-min-ge", lines: ["日出而作，日入而息。", "鑿井而飲，耕田而食。", "帝力於我何有哉！"] },
  { slug: "kang-qu-yao", title: "康衢謠", author: "堯時民歌", authorSlug: "yao-shi-min-ge", lines: ["立我蒸民，莫匪爾極。", "不識不知，順帝之則。"] },
  { slug: "yi-qi-shi-la-ci", title: "伊耆氏蠟辭", author: "伊耆氏", authorSlug: "yi-qi-shi", lines: ["土反其宅，水歸其壑。", "昆蟲毋作，草木歸其澤。"] },
  { slug: "yao-jie", title: "堯戒", author: "堯", authorSlug: "yao", lines: ["戰戰慄慄，日謹一日。", "人莫躓於山，而躓於垤。"] },
  { slug: "qing-yun-ge", title: "卿雲歌", author: "佚名", authorSlug: "yi-ming-qing-yun", lines: ["卿雲爛兮，糺縵縵兮。", "日月光華，旦復旦兮。"] },
  { slug: "ba-bo-ge", title: "八伯歌", author: "佚名", authorSlug: "yi-ming-ba-bo", lines: ["明明上天，爛然星陳。", "日月光華，弘於一人。"] },
  { slug: "di-zai-ge", title: "帝載歌", author: "佚名", authorSlug: "yi-ming-di-zai", lines: ["日月有常，星辰有行。", "四時從經，萬姓允誠。", "於予論樂，配天之靈。", "遷於賢善，莫不咸聽。", "鼚乎鼓之，軒乎舞之。", "菁華已竭，褰裳去之。"] },
  { slug: "nan-feng-ge", title: "南風歌", author: "舜", authorSlug: "shun", lines: ["南風之熏兮，可以解吾民之慍兮！", "南風之時兮，可以阜吾民之財兮！"] },
  { slug: "yu-yu-die-ci", title: "禹玉牒辭", author: "禹", authorSlug: "yu", lines: ["祝融司方發其英，", "沐日浴月百寶生。"] },
  { slug: "xia-hou-zhu-ding-yao", title: "夏后鑄鼎繇", author: "禹", authorSlug: "yu", lines: ["逢逢白雲，一南一北，一西一東。", "九鼎既成，遷於三國。"] },
  { slug: "shang-ming", title: "商銘", author: "佚名", authorSlug: "yi-ming-shang-ming", lines: ["嗛嗛之德，不足就也，不可以矜，而祗取憂也。", "嗛嗛之食，不足狃也，不能為膏，而祗離咎也。"] },
  { slug: "mai-xiu-ge", title: "麥秀歌", author: "箕子", authorSlug: "ji-zi", lines: ["麥秀漸漸兮，禾黍油油，", "彼狡童兮，不與我好兮。"] },
  { slug: "cai-wei-ge", title: "採薇歌", author: "伯夷", authorSlug: "bo-yi", lines: ["登彼西山兮，採其薇矣。", "以暴易暴兮，不知其非矣。", "神農虞夏，忽焉沒兮，吾適安歸矣！", "籲嗟徂兮，命之衰矣！"] },
  { slug: "guan-pan-ming", title: "盥盤銘", author: "佚名", authorSlug: "yi-ming-guan-pan", lines: ["與其溺於人也，寧溺於淵。", "溺於淵猶可遊也，溺於人不可救也。"] },
  { slug: "dai-ming", title: "帶銘", author: "佚名", authorSlug: "yi-ming-dai", lines: ["火滅修容，慎戒必恭，恭則壽。"] },
  { slug: "zhang-ming", title: "杖銘", author: "佚名", authorSlug: "yi-ming-zhang", lines: ["惡乎危，於忿懥。", "惡乎失道，於嗜欲。", "惡乎相忘，于富貴。"] },
  { slug: "yi-ming", title: "衣銘", author: "佚名", authorSlug: "yi-ming-yi", lines: ["桑蠶苦，女工難，得新捐故後必寒。"] },
  { slug: "bi-ming", title: "筆銘", author: "佚名", authorSlug: "yi-ming-bi", lines: ["豪毛茂茂，陷水可脫，陷文不活。"] },
  { slug: "mao-ming", title: "矛銘", author: "佚名", authorSlug: "yi-ming-mao", lines: ["造矛造矛，少間弗忍，終身之羞。", "余一人所聞，以戒後世子孫。"] },
  { slug: "shu-che", title: "書車", author: "佚名", authorSlug: "yi-ming-shu-che", lines: ["自致者急，載人者緩。", "取欲無度，自致而反。"] },
  { slug: "shu-hu", title: "書戶", author: "佚名", authorSlug: "yi-ming-shu-hu", lines: ["出畏之，入懼之。"] },
  { slug: "shu-lv", title: "書履", author: "佚名", authorSlug: "yi-ming-shu-lv", lines: ["行必履正，無懷僥倖。"] },
  { slug: "shu-yan", title: "書硯", author: "佚名", authorSlug: "yi-ming-shu-yan", lines: ["石墨相著而黑，邪心讒言，無得汙白。"] },
  { slug: "shu-feng", title: "書鋒", author: "佚名", authorSlug: "yi-ming-shu-feng", lines: ["忍之須臾，乃全汝軀。"] },
  { slug: "shu-zhang", title: "書杖", author: "佚名", authorSlug: "yi-ming-shu-zhang", lines: ["輔人無苟，扶人無咎。"] },
  { slug: "shu-jing", title: "書井", author: "佚名", authorSlug: "yi-ming-shu-jing", lines: ["原泉滑滑，連旱則絕。", "取事有常，賦斂有節。"] },
  { slug: "bai-yun-yao", title: "白雲謠", author: "佚名", authorSlug: "yi-ming-bai-yun", lines: ["白雲在天，丘陵自出。", "道里悠遠，山川間之。", "將子無死，尚復能來。"] },
  { slug: "qi-zhao", title: "祈招", author: "佚名", authorSlug: "yi-ming-qi-zhao", lines: ["祈招之愔愔，式昭德音。", "思我王度，式如玉，式如金。", "形民之力，而無醉飽之心。"] },
  { slug: "yi-shi-yao", title: "懿氏繇", author: "懿氏", authorSlug: "yi-shi", lines: ["鳳凰于飛，和鳴鏘鏘。", "有妫之後，將育于姜。", "五世其昌，並于正卿。", "八世之後，莫之與京。"] },
  { slug: "ding-ming", title: "鼎銘", author: "佚名", authorSlug: "yi-ming-ding", lines: ["一命而僂，再命而伛，三命而俯。", "循牆而走，亦莫余敢侮。", "饘於是，鬻於是，以糊余口。"] },
  { slug: "yu-zhen", title: "虞箴", author: "佚名", authorSlug: "yi-ming-yu-zhen", lines: ["芒芒禹跡，畫為九州，經啟九道。", "民有寢廟，獸有茂草，各有攸處，德用不擾。", "在帝夷羿，冒于原獸，忘其國恤，而思其牝牡。", "武不可重，用不恢于夏家。", "獸臣思原，敢告僕夫。"] },
  { slug: "fan-niu-ge", title: "飯牛歌", author: "甯戚", authorSlug: "ning-qi", lines: ["南山矸，白石爛，生不逢堯與舜禪。", "短布單衣適至骭，從昏飯牛薄夜半，長夜漫漫何時旦！", "滄浪之水白石粲，中有鯉魚長尺半。", "敝布單衣裁至骭，清朝飯牛至夜半。", "黃犢上坂且休息，吾將舍汝相齊國。", "出東門兮歷石班，上有松柏青且闌。", "粗布衣兮縕縷，時不遇兮堯舜主。", "牛兮努力食細草，大臣在爾側，吾當與汝適楚國。"] },
  { slug: "qin-ge-bai-li-xi", title: "琴歌", author: "百里奚", authorSlug: "bai-li-xi", lines: ["百里奚，五羊皮。", "憶別時，烹伏雌，炊扊扅。", "今日富貴忘我為！"] },
  { slug: "xia-yu-ge", title: "暇豫歌", author: "佚名", authorSlug: "yi-ming-xia-yu", lines: ["暇豫之吾吾，不如鳥烏。", "人皆集于菀，己獨集于枯。"] },
  { slug: "song-cheng-zhe-ou", title: "宋城者謳", author: "佚名", authorSlug: "yi-ming-song-cheng", lines: ["睅其目，皤其腹，棄甲而復。", "于思于思，棄甲復來。"] },
  { slug: "can-cheng-da-ge", title: "驂乘答歌", author: "佚名", authorSlug: "yi-ming-can-cheng", lines: ["牛則有皮，犀兕尚多，棄甲則那。"] },
  { slug: "yi-ren-you-ge", title: "役人又歌", author: "佚名", authorSlug: "yi-ming-yi-ren", lines: ["從有其皮，丹漆若何！"] },
  { slug: "qu-yu-ge", title: "鸜鵒歌", author: "佚名", authorSlug: "yi-ming-qu-yu", lines: ["鸜鵒之羽，公在外野，往饋之馬。", "鸜鵒之巢，遠哉遙遙，稠父喪勞，宋父以驕。", "鸜鵒鸜鵒，往歌來哭。"] },
  { slug: "ze-men-zhi-xi-ou", title: "澤門之皙謳", author: "佚名", authorSlug: "yi-ming-ze-men", lines: ["澤門之皙，實興我役。", "邑中之黔，實慰我心。"] },
  { slug: "kang-kai-ge", title: "忼慷歌", author: "佚名", authorSlug: "yi-ming-kang-kai", lines: ["貪吏而不可為而可為，廉吏而可為而不可為。", "貪吏而不可為者，當時有污名；而可為者，子孫以家成。", "廉吏而可為者，當時有清名；而不可為者，子孫困窮被褐而負薪。", "貪吏常苦富，廉吏常苦貧。", "獨不見楚相孫叔敖，廉潔不受錢。"] },
  { slug: "zi-chan-song", title: "子產誦", author: "子產", authorSlug: "zi-chan", lines: ["取我衣冠而褚之，取我田疇而伍之。", "孰殺子產，吾其與之。", "我有子弟，子產誨之。", "我有田疇，子產殖之。", "子產而死，誰其嗣之！"] },
  { slug: "kong-zi-song", title: "孔子誦", author: "孔子", authorSlug: "kong-zi", lines: ["麛裘而革畢，投之無戾。", "革畢之麛裘，投之無郵。", "衮衣章甫，實獲我所。", "章甫衮衣，惠我無私。"] },
  { slug: "qu-lu-ge", title: "去魯歌", author: "孔子", authorSlug: "kong-zi", lines: ["彼婦之口，可以出走。", "彼婦之謁，可以死敗。", "蓋優哉游哉，維以卒歲。"] },
  { slug: "hui-guo-ge", title: "蟪蛄歌", author: "佚名", authorSlug: "yi-ming-hui-guo", lines: ["違山十里，蟪蛄之聲，猶尚在耳。"] },
  { slug: "lin-he-ge", title: "臨河歌", author: "佚名", authorSlug: "yi-ming-lin-he", lines: ["狄水衍兮風揚波，舟楫顛倒更相加。", "歸來歸來胡為斯？"] },
  { slug: "chu-pin-ge", title: "楚聘歌", author: "佚名", authorSlug: "yi-ming-chu-pin", lines: ["大道隱兮禮為基，賢人竄兮將待時。", "天下如一兮欲何之！"] },
  { slug: "huo-lin-ge", title: "獲麟歌", author: "孔子", authorSlug: "kong-zi", lines: ["唐虞世兮麟鳳遊，今非其時來何求！", "麟兮麟兮我心憂。"] },
  { slug: "gui-shan-cao", title: "龜山操", author: "孔子", authorSlug: "kong-zi", lines: ["予欲望魯兮，龜山蔽之。", "手無斧柯，奈龜山何？"] },
  { slug: "pan-cao", title: "盤操", author: "佚名", authorSlug: "yi-ming-pan-cao", lines: ["干澤而漁，蛟龍不游。", "覆巢毀卵，鳳不翔留。", "慘予心悲，還原息陬。"] },
  { slug: "shui-xian-cao", title: "水仙操", author: "伯牙", authorSlug: "bo-ya", lines: ["繄洞渭兮流澌濩，舟楫逝兮仙不還。", "移形素兮蓬萊山，欽傷宮仙不還。"] },
  { slug: "jie-yu-ge", title: "接輿歌", author: "接輿", authorSlug: "jie-yu", lines: ["鳳兮鳳兮，何如德之衰也。", "來世不可待，往世不可追也。", "天下有道，聖人成焉。", "天下無道，聖人生焉。", "方今之時，僅免刑焉。", "福輕乎羽，莫之知載。", "禍重乎地，莫之知避。", "已乎已乎，臨人以德。", "殆乎殆乎，畫地而趨。", "迷陽迷陽，無傷吾行。", "吾行卻曲，無傷吾足。"] },
  { slug: "cheng-ren-ge", title: "成人歌", author: "佚名", authorSlug: "yi-ming-cheng-ren", lines: ["蠶則績而蟹有匡，范則冠而蟬有緌，", "兄則死而子皋為之衰。"] },
  { slug: "yu-fu-ge", title: "漁父歌", author: "漁父", authorSlug: "yu-fu", lines: ["日月昭昭乎寢已馳，與子期乎蘆之漪。", "日已夕兮，予心憂悲。", "月已馳兮，何不渡為！事寢急兮將奈何！", "蘆中人，豈非窮士乎！"] },
  { slug: "xie-yin-ge", title: "偕隱歌", author: "佚名", authorSlug: "yi-ming-xie-yin", lines: ["天下有道，我黻子佩。", "天下無道，我負子戴。"] },
  { slug: "xu-ren-ge", title: "徐人歌", author: "徐人", authorSlug: "xu-ren", lines: ["延陵季子兮不忘故，脫千金之劍兮帶丘墓。"] },
  { slug: "yue-ren-ge", title: "越人歌", author: "佚名", authorSlug: "yi-ming-yue-ren", lines: ["今夕何夕兮，搴舟中流。", "今日何日兮，得與王子同舟。", "蒙羞被好兮，不訾詬恥。", "心幾煩而不絕兮，得知王子。", "山有木兮木有枝，心悅君兮君不知。"] },
  { slug: "yue-yao-ge", title: "越謠歌", author: "佚名", authorSlug: "yi-ming-yue-yao", lines: ["君乘車，我戴笠，他日相逢下車揖。", "君擔簦，我跨馬，他日相逢為君下。"] },
  { slug: "qin-ge-yue-mo-le", title: "琴歌", author: "佚名", authorSlug: "yi-ming-qin-ge", lines: ["樂莫樂兮新相知，悲莫悲兮生別離。"] },
  { slug: "ling-bao-yao", title: "靈寶謠", author: "佚名", authorSlug: "yi-ming-ling-bao", lines: ["吳王出遊觀震湖，龍威丈人山隱居。", "北上包山入靈墟，乃入洞庭竊禹書。", "天地大文不可舒，此文長傳百六初，若強取出喪國廬。"] },
  { slug: "wu-fu-cha-shi-tong-yao", title: "吳夫差時童謠", author: "童謠", authorSlug: "tong-yao-wu", lines: ["梧宮秋，吳王愁。"] },
  { slug: "wu-que-ge", title: "烏鵲歌", author: "佚名", authorSlug: "yi-ming-wu-que", lines: ["南山有烏，北山羅網。", "烏自高飛，羅當奈何！", "烏鵲雙飛，不樂鳳凰。", "妾是庶人，不樂宋王。"] },
  { slug: "da-fu-ge", title: "答夫歌", author: "佚名", authorSlug: "yi-ming-da-fu", lines: ["其雨淫淫，河大水深，日出當心。"] },
  { slug: "yue-qun-chen-zhu", title: "越群臣祝", author: "越群臣", authorSlug: "yue-qun-chen", lines: ["皇天佑助，前沈後揚。", "禍為德根，憂為福堂。", "威人者滅，服從者昌。", "王離牽致，其後無殃。", "君臣生離，感動上皇。", "眾夫悲哀，莫不感傷。", "臣請薄脯，酒行二觴。", "大王德壽，無疆無極。", "乾坤受靈，神祇輔翼。", "我王厚之，祉佑在側。", "德銷百殃，利受其福。", "去彼吳庭，來歸越國。"] },
  { slug: "zhu-yue-wang-ci", title: "祝越王辭", author: "越群臣", authorSlug: "yue-qun-chen", lines: ["皇天佑助，我王受福。", "良臣集謀，我王之德。", "宗廟輔政，鬼神承翼。", "君不忘臣，臣盡其力。", "上天蒼蒼，不可掩塞。", "觴酒二升，萬福無極。", "我王仁賢，懷道抱德。", "滅仇破吳，不忘返國。", "賞無所，群邪杜塞。", "君臣同和，福佑千億。", "觴酒二升，萬歲難極。"] },
  { slug: "tan-ge", title: "彈歌", author: "佚名", authorSlug: "yi-ming-tan-ge", lines: ["斷竹續竹，飛土逐宍。"] },
  { slug: "rang-tian-zhe-zhu", title: "禳田者祝", author: "佚名", authorSlug: "yi-ming-rang-tian", lines: ["甌窶滿篝，污邪滿車。", "五穀蕃熟，穰穰滿家。"] },
  { slug: "ba-yao-ge", title: "巴謠歌", author: "佚名", authorSlug: "yi-ming-ba-yao", lines: ["神仙得者茅初成，駕龍上升入太清。", "時下玄洲戲赤城，繼世而往在我盈，帝若學之臘嘉平。"] },
  { slug: "yi-shui-ge", title: "易水歌", author: "荊軻", authorSlug: "jing-ke", lines: ["風蕭蕭兮易水寒，壯士一去兮不復還。"] },
  { slug: "san-qin-ji-min-yao", title: "三秦記民謠", author: "民謠", authorSlug: "min-yao-san-qin", lines: ["武功太白，去天三百。", "孤雲兩角，去天一握。", "山水險阻，黃金子午。", "蛇盤烏櫳，勢與天通。"] },
  { slug: "chu-ren-yao", title: "楚人謠", author: "民謠", authorSlug: "min-yao-chu", lines: ["楚雖三戶，亡秦必楚。"] },
  { slug: "he-tu-yin-shu-yao", title: "河圖引蜀謠", author: "民謠", authorSlug: "min-yao-shu", lines: ["汶阜之山，江出其腹。", "帝以會昌，神以建福。"] },
  { slug: "xiang-zhong-yu-ge", title: "湘中漁歌", author: "佚名", authorSlug: "yi-ming-xiang-zhong", lines: ["帆隨湘轉，望衡九面。"] },
  { slug: "tai-gong-bing-fa-yin-huang-di-yu", title: "太公兵法引黃帝語", author: "黃帝", authorSlug: "huang-di", lines: ["日中不彗，是謂失時。", "操刀不割，失利之期。", "執柯不伐，賊人將來。", "涓涓不塞，將為江河。", "熒熒不救，炎炎奈何。", "兩葉不去，將用斧柯。", "為虺弗摧，行將為蛇。"] },
  { slug: "liu-tao", title: "六韜", author: "六韜", authorSlug: "liu-tao", lines: ["天下攘攘，皆為利往。", "天下熙熙，皆為利來。"] },
  { slug: "guan-zi-yin-yu", title: "管子", author: "管子", authorSlug: "guan-zi", lines: ["牆有耳，伏寇在側。"] },
  { slug: "zuo-zhuan-yin-yi-shi", title: "左傳引逸詩", author: "左傳引逸詩", authorSlug: "zuo-zhuan-yi-shi", lines: ["翹翹車乘，招我以弓。", "豈不欲往，畏我友朋。", "俟河之清，人壽幾何！", "兆雲詢多，職競作羅。", "雖有絲麻，無棄菅蒯。", "雖有姬姜，無棄蕉萃。", "凡百君子，莫不代匱。"] },
  { slug: "zuo-zhuan-yin-yu", title: "左傳", author: "左傳", authorSlug: "zuo-zhuan", lines: ["山有木，工則度之？", "賓有禮，主則擇之。", "心苟無瑕，何恤乎無家。", "畏首畏尾，身其餘幾！", "雖鞭之長，不及馬腹。"] },
  { slug: "guo-yu-yin-yu", title: "國語", author: "國語", authorSlug: "guo-yu", lines: ["獸惡其網，民怨其上。", "眾心成城，眾口鑠金。", "從善如登，從惡如崩。"] },
  { slug: "kong-zi-jia-yu", title: "孔子家語", author: "孔子家語", authorSlug: "kong-zi-jia-yu", lines: ["相馬以輿，相士以居。"] },
  { slug: "lie-zi-yin-yu", title: "列子", author: "列子", authorSlug: "lie-zi", lines: ["生相憐，死相捐。", "人不婚宦，情欲失半。", "人不衣食，君臣道息。"] },
  { slug: "han-fei-zi", title: "韓非子", author: "韓非子", authorSlug: "han-fei-zi", lines: ["奔車之上無仲尼，覆舟之下無伯夷。"] },
  { slug: "shen-zi", title: "慎子", author: "慎子", authorSlug: "shen-zi", lines: ["不聰不明，不能為王！", "不瞽不聾，不能為公。"] },
  { slug: "lu-lian-zi", title: "魯連子", author: "魯連子", authorSlug: "lu-lian-zi", lines: ["心誠憐，白髮玄。", "情不怡，艷色媸。"] },
  { slug: "zhan-guo-ce-yin-yu", title: "戰國策", author: "戰國策", authorSlug: "zhan-guo-ce", lines: ["寧為雞口，無為牛後。", "削株掘根，無與禍鄰，禍乃不存。"] },
  { slug: "shi-ji-yin-yu", title: "史記", author: "史記", authorSlug: "shi-ji", lines: ["蓬生麻中，不扶自直。", "白沙在泥，與之俱黑。", "當斷不斷，反受其亂。", "長袖善舞，多錢善賈。"] },
  { slug: "han-shu-yin-yu", title: "漢書", author: "漢書", authorSlug: "han-shu", lines: ["狡兔死，走狗烹。", "飛鳥盡，良弓藏。", "敵國破，謀臣亡。", "不習為吏，視已成事。", "水至清則無魚，人至察則無徒。", "千人所指，無病而死。"] },
  { slug: "lie-nv-zhuan-yin-gu-yu", title: "列女傳引古語", author: "列女傳", authorSlug: "lie-nv-zhuan", lines: ["力田不如遇豐年，力桑不如見國卿，", "刺繡文不如倚市門。"] },
  { slug: "shuo-yuan", title: "說苑", author: "說苑", authorSlug: "shuo-yuan", lines: ["綿綿之葛，在於曠野。", "良士得之，以為絺綌。", "良工不得，枯死於野。"] },
  { slug: "liu-xiang-bie-lu-yin-gu-yu", title: "劉向別錄引古語", author: "劉向別錄", authorSlug: "liu-xiang-bie-lu", lines: ["唇亡而齒寒，河水崩其壞在山。"] },
  { slug: "xin-xu", title: "新序", author: "新序", authorSlug: "xin-xu", lines: ["蠹喙仆柱梁，蚊芒走牛羊。"] },
  { slug: "feng-su-tong-yin-yan", title: "風俗通", author: "風俗通", authorSlug: "feng-su-tong", lines: ["狐欲渡河，無奈尾何。", "婦死腹悲，惟身知之。", "縣官漫漫，怨死者半。", "金不可作，世不可度。"] },
  { slug: "huan-zi-xin-lun-yin-yan", title: "桓子新論引諺", author: "桓子新論", authorSlug: "huan-zi-xin-lun", lines: ["人聞長安樂，則出門而西向笑！", "知肉味美，則對屠門而大嚼。"] },
  { slug: "mou-zi-yin-gu-yan", title: "牟子引古諺", author: "牟子", authorSlug: "mou-zi", lines: ["少所見，多所怪，見橐駝言馬腫背。"] },
  { slug: "yi-wei-yin-gu-shi", title: "易緯引古詩", author: "易緯", authorSlug: "yi-wei", lines: ["一夫兩心，拔刺不深。", "踬馬破車，惡婦破家。"] },
  { slug: "si-min-yue-ling-yin-nong-yu", title: "四民月令引農語", author: "四民月令", authorSlug: "si-min-yue-ling", lines: ["三月昏，參星夕。", "杏花盛，桑葉白。", "河射角，堪夜作。", "犁星沒，水生骨。"] },
  { slug: "yue-ling-zhu-yin-li-yu", title: "月令注引俚語", author: "月令注", authorSlug: "yue-ling-zhu", lines: ["蜻蛉鳴，衣裘成。", "蟋蟀鳴，懶婦驚。"] },
  { slug: "shui-jing-zhu-yin-yan", title: "水經注引諺", author: "水經注", authorSlug: "shui-jing-zhu", lines: ["射的白，斛米百。", "射的玄，斛米千。"] },
  { slug: "shan-jing-yin-xiang-zhong-shu", title: "山經引相冢書", author: "山經", authorSlug: "shan-jing", lines: ["山川而能語，葬師食無所。", "肺腑而能語，醫師色如土。"] },
  { slug: "wen-xuan-zhu-yin-gu-yan", title: "文選注引古諺", author: "文選注", authorSlug: "wen-xuan-zhu", lines: ["越阡度陌，互為主客。"] },
  { slug: "wei-zhi-wang-chang-yin-yan", title: "魏志王昶引諺", author: "魏志", authorSlug: "wei-zhi", lines: ["救寒無若重裘，止謗莫若自修。"] },
  { slug: "liang-shi", title: "梁史", author: "梁史", authorSlug: "liang-shi", lines: ["屋漏在上，知之在下。"] },
  { slug: "shi-zhao-tong-jian-shu-yin-yan", title: "史照通鑒疏引諺", author: "史照通鑒疏", authorSlug: "shi-zhao-tong-jian-shu", lines: ["足寒傷心，民怨傷國。"] },
  { slug: "gu-yan-gu-yu", title: "古諺古語", author: "古諺", authorSlug: "gu-yan", lines: ["觸露不掐葵，日中不剪韭。", "將飛者翼伏，將奮者足跼，將噬者爪縮，將文者且朴。", "上求材，臣殘木。上求魚，下干谷。", "無鄉之社，易為黍肉。無國之稷，易為求福。"] },
];

function renderPoem({ slug, title, author, authorSlug, lines }) {
  return `---
title: ${title}
author: ${author}
authorSlug: ${authorSlug}
dynasty: ${DYNASTY}
volume: ${VOLUME}
base: ${BASE}
---

${lines.join("\n")}
`;
}

fs.mkdirSync(path.join(ROOT, "content", "volumes"), { recursive: true });

const manifest = POEMS.map((p) => p.slug);
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

let written = 0;
for (const poem of POEMS) {
  const outPath = path.join(POEMS_DIR, `${poem.slug}.md`);
  fs.writeFileSync(outPath, renderPoem(poem));
  written++;
}

console.log(`Wrote ${written} poems and manifest (${manifest.length} slugs).`);
