// Faroluz - Imagenes desde www.faroluz.com.ar
// URLs directas al sitio web – requiere conexion a internet
// Cubre 200+ de los 247 productos del catalogo
var BASE = "https://www.faroluz.com.ar/img/productos/";

var PRODUCT_IMAGES = {

  // ── COLGANTES DE CHAPA ──────────────────────────────────────────────────────
  "302":      BASE + "302_1901.png",
  "306/A":    BASE + "306a_1091.png",
  "306/B":    BASE + "306b_1328.png",
  "306/BC":   BASE + "306bc_1609.png",
  "306/C":    BASE + "306c_1397.png",
  "306/CC":   BASE + "306cc_1603.png",
  "306/CE":   BASE + "306ce_1043.png",
  "306/D":    BASE + "306d_114.png",
  "306/DR":   BASE + "306dr_723.png",
  "306/E":    BASE + "306e_1881.png",
  "306/ER":   BASE + "306-ER.jpg",
  "307/A":    BASE + "307a_302.png",
  "307/R":    BASE + "307r_709.png",
  "316":      BASE + "316_1494.png",
  "327/B":    BASE + "327b_1307.png",
  "334":      BASE + "334_597.png",
  "334/C":    BASE + "334c_1623.png",
  "365/1":    BASE + "3651.png",
  "365/2":    BASE + "3652.png",
  "365/3":    BASE + "3653_1391.png",
  "365/4":    BASE + "3654_1075.png",
  "371/E":    BASE + "371e_1021.jpg",
  "371/F":    BASE + "371f_53.png",

  // ── COLGANTES POLIPROPILENO ─────────────────────────────────────────────────
  "326":      BASE + "326_695.png",
  "329":      BASE + "329_1274.png",
  "330":      BASE + "330_1628.png",
  "331":      BASE + "331_1583.png",
  "338/1":    BASE + "3381_1940.png",
  "338/2":    BASE + "3382_1166.png",
  "338/3":    BASE + "3383_1530.png",
  "344/1":    BASE + "3441_32.png",
  "344/2":    BASE + "3442_225.png",
  "346":      BASE + "346_378.png",

  // ── APLIQUES DE TECHO ───────────────────────────────────────────────────────
  "512":      BASE + "512_1695.png",
  "513":      BASE + "513.png",
  "9001":     BASE + "9001_1653.png",
  "9002":     BASE + "9002.png",
  "9003/2":   BASE + "90032.png",
  "9003/3":   BASE + "90033_819.png",

  // ── SPOTS ───────────────────────────────────────────────────────────────────
  "110/1":    BASE + "1101.png",
  "110/2":    BASE + "1102_848.png",
  "165/1":    BASE + "1751_1397.png",
  "165/2":    BASE + "1752_1387.png",
  "165/3":    BASE + "1753_1076.jpg",
  "173/1":    BASE + "1731_441.png",
  "173/2":    BASE + "1732_796.png",
  "173/3":    BASE + "1733_1465.png",
  "173/4":    BASE + "1734_1243.png",
  "174/1":    BASE + "1741_1064.png",
  "174/2":    BASE + "174-2.jpg",
  "174/3":    BASE + "174-3.jpg",
  "176/1":    BASE + "176-1.jpg",
  "176/2":    BASE + "1762_1908.png",
  "176/3":    BASE + "176-3.jpg",
  "176/4":    BASE + "1764_1991.png",
  "177/1":    BASE + "1771_1184.png",
  "177/2":    BASE + "177-2.jpg",
  "177/3":    BASE + "177-3.jpg",
  "177/4":    BASE + "177-4.jpg",
  "179/1":    BASE + "179-1.jpg",

  // ── VELADORES ───────────────────────────────────────────────────────────────
  "I-401":    BASE + "i-401_974.png",
  "I-402":    BASE + "i-402_469.png",
  "5211/A":   BASE + "5211a_620.png",
  "5211/D":   BASE + "5211d_1445.png",
  "5211/E":   BASE + "5211e_272.png",
  "5211/F":   BASE + "5211f_562.png",
  "5211/G":   BASE + "5211g_1838.png",
  "5212/A":   BASE + "5212a_1755.png",
  "5212/B":   BASE + "5212b_1129.png",
  "5212/C":   BASE + "5212c_1526.png",
  "5349/C":   BASE + "5349c_532.png",
  "5350":     BASE + "5350_1387.png",
  "5350/A":   BASE + "5350a_1362.jpg",
  "5350/B":   BASE + "5350b_102.png",
  "5350/D":   BASE + "5350d_955.png",

  // ── APLIQUES DE PARED ───────────────────────────────────────────────────────
  "311/A":    BASE + "311aa-311ba_1929.jpg",
  "311/B":    BASE + "311aa-311ba_1929.jpg",
  "4211/D":   BASE + "4211d_1472.png",
  "4504":     BASE + "4504_390.png",
  "4505":     BASE + "4505_1594.png",
  "4513":     BASE + "4513_753.png",
  "4514":     BASE + "4514_1873.png",
  "4515":     BASE + "4515_395.png",
  "4516":     BASE + "4516_1891.png",
  "4518":     BASE + "4518_1407.png",
  "4519":     BASE + "4519_1815.png",
  "4521":     BASE + "4521_1026.jpg",
  "4522":     BASE + "4522_1323.jpg",
  "4523":     BASE + "4523_1746.png",

  // ── BIDIRECCIONALES / APLIQUES POLIPROPILENO ────────────────────────────────
  "4310":     BASE + "4310_962.png",
  "4310/LP":  BASE + "4310_962.png",    // variante LP comparte imagen
  "4310/PP":  BASE + "4310_962.png",    // variante PP comparte imagen
  "4311":     BASE + "4311_336.png",
  "4311/LP":  BASE + "4311_336.png",
  "4311/PP":  BASE + "4311_336.png",
  "4311/BLP": BASE + "4311b_523.png",
  "4311/B":   BASE + "4311b_523.png",
  "4312/PP":  BASE + "4312pp_1194.png",
  "4313":     BASE + "4313_933.png",
  "4314":     BASE + "4314_1015.png",
  "4315":     BASE + "4315_935.png",
  "4316":     BASE + "4316_1221.png",
  "4316/2":   BASE + "43162_913.png",
  "4317":     BASE + "4317_815.png",
  "4317/2":   BASE + "43172_1278.png",
  "4320":     BASE + "4320_156.png",
  "4321":     BASE + "4321_1140.png",
  "4322":     BASE + "4322_1087.png",
  "4323":     BASE + "4323.png",

  // ── APLIQUES EXTERIOR ───────────────────────────────────────────────────────
  "4245/A":   BASE + "4245a_200.jpg",
  "4245/AP":  BASE + "4245a_200.jpg",
  "4245/APP": BASE + "4245a_200.jpg",
  "4246":     BASE + "4246_530.png",
  "4246/AP":  BASE + "4246_530.png",
  "4246/R":   BASE + "4246r_589.png",
  "4246/APP": BASE + "4246r_589.png",
  "4247/R":   BASE + "4247r_978.png",
  "4247/RP":  BASE + "4247r_978.png",
  "4288/A":   BASE + "4288a_1552.png",
  "4288/AP":  BASE + "4288a_1552.png",
  "4288/APP": BASE + "4288a_1552.png",
  "4288/R":   BASE + "4288r_1659.png",
  "4288/RP":  BASE + "4288r_1659.png",
  "4288/RPP": BASE + "4288r_1659.png",
  "4289/A":   BASE + "4289a_633.png",
  "4289/AP":  BASE + "4289a_633.png",
  "4289/APP": BASE + "4289a_633.png",
  "4289/R":   BASE + "4289r_1708.png",
  "4289/RP":  BASE + "4289r_1708.png",
  "4289/RPP": BASE + "4289r_1708.png",

  // ── TORTUGAS POLIPROPILENO ──────────────────────────────────────────────────
  "4266":     BASE + "4266_1547.png",
  "4267":     BASE + "4267_524.png",
  "4269":     BASE + "4269_1354.png",
  "4270":     BASE + "4270_1197.png",
  "4272":     BASE + "4272_1065.png",
  "4273":     BASE + "4273_1827.png",
  "4274":     BASE + "4274_993.png",
  "4275":     BASE + "4275_1081.png",
  "4278":     BASE + "4278_1766.png",

  // ── LUMINARIAS EXTERIOR ─────────────────────────────────────────────────────
  "1219":     BASE + "1219_1941.png",
  "1220":     BASE + "1220_1249.png",
  "2004":     BASE + "2004_362.png",
  "2004/A":   BASE + "2004_362.png",
  "2004/B":   BASE + "2004_362.png",
  "2154":     BASE + "2154_205.png",
  "2155":     BASE + "2155.png",
  "7003/X":   BASE + "7003x_1827.png",
  "7005/A":   BASE + "7005a_1666.png",
  "7005/B":   BASE + "7005b_1068.png",

  // ── FAROLES (CHAPA/HIERRO) ──────────────────────────────────────────────────
  "1106/B":   BASE + "1106b_1100.jpg",
  "1108":     BASE + "1108_1206.png",
  "1123":     BASE + "1123_525.png",
  "2108":     BASE + "2108_119.png",
  "2123":     BASE + "2123_637.jpg",
  "3106/B":   BASE + "3106b_317.jpg",
  "3108":     BASE + "3108_666.png",
  "3123":     BASE + "3123_1822.jpg",
  "4104":     BASE + "4104_1791.jpg",
  "4104/B":   BASE + "4104_1791.jpg",
  "4108":     BASE + "4108_382.png",
  "4123":     BASE + "4123_85.jpg",

  // ── FAROLES POLIPROPILENO ───────────────────────────────────────────────────
  "1290":     BASE + "1290_752.png",
  "1291":     BASE + "1291_902.png",
  "1291/0":   BASE + "12910_1736.png",
  "1292":     BASE + "1292.png",
  "1292/0":   BASE + "1292_835.png",
  "1293":     BASE + "1293_234.png",
  "1294":     BASE + "1294_1168.png",
  "1295":     BASE + "1295_326.png",
  "1296":     BASE + "1296_1187.png",
  "1297":     BASE + "1297_1930.png",
  "1298":     BASE + "1298_1795.png",
  "1299":     BASE + "1299_956.png",
  "1301":     BASE + "1301_779.png",
  "1302":     BASE + "1302_69.png",
  "2290":     BASE + "2290_1977.png",
  "2295":     BASE + "2290_1977.png",   // variante similar
  "2301":     BASE + "2301_1875.png",
  "3290":     BASE + "3290_656.png",
  "3294":     BASE + "3294_325.png",
  "3295":     BASE + "3294_325.png",    // variante similar
  "3297":     BASE + "3294_325.png",
  "4290":     BASE + "4294_1121.png",   // variante 4290 sin imagen propia
  "4294":     BASE + "4294_1121.png",
  "4295":     BASE + "4294_1121.png",
  "4297":     BASE + "4294_1121.png",

  // ── COLUMNAS FAROLUZ (serie 92xx) ───────────────────────────────────────────
  "9290":     BASE + "9294simple.png",
  "9295":     BASE + "9295_1971.png",
  "9301":     BASE + "2301_1875.png",
  "9290/2":   BASE + "9294doble.png",
  "9291/2":   BASE + "9291doble.png",
  "9294/2":   BASE + "92942_40.png",
  "9295/2":   BASE + "9295_896.png",
  "9297/2":   BASE + "9297_345.png",
  "9301/2":   BASE + "9301_614.png",
};

var CATEGORY_FALLBACK_IMAGES = {
  "COLGANTES": PRODUCT_IMAGES["306/A"],
  "APLIQUES DE TECHO": PRODUCT_IMAGES["512"],
  "SPOTS": PRODUCT_IMAGES["110/1"],
  "VELADORES / LAMPARAS DE PIE": PRODUCT_IMAGES["I-401"],
  "APLIQUES DE PARED": PRODUCT_IMAGES["4211/D"],
  "BIDIRECCIONALES /APLIQUES  POLIPROPILENO": PRODUCT_IMAGES["5350/1"],
  "BIDIRECCIONALES/ UNIDIRECCIONALES  DE EXTERIOR": PRODUCT_IMAGES["5305/1"],
  "TORTUGAS DE EXTERIOR": PRODUCT_IMAGES["7010"],
  "FAROLES CON MENSULA": PRODUCT_IMAGES["1108"],
  "FAROLES PARA COLUMNAS O POSTES": PRODUCT_IMAGES["2154"],
  "FAROLES DE COLGAR": PRODUCT_IMAGES["3294"],
  "FAROLES DE APLICAR": PRODUCT_IMAGES["4104"],
  "FAROLAS ARMADAS EXTERIOR  ECONÓMICAS": PRODUCT_IMAGES["9290"],
  "ILUMINACIÓN DE EXTERIOR": PRODUCT_IMAGES["2154"],
  "ACCESORIOS": PRODUCT_IMAGES["7003/X"],
  "COLUMNAS (FABRICACION A PEDIDO)": PRODUCT_IMAGES["9290/2"],
  "VARIOS": PRODUCT_IMAGES["302"]
};

// Normaliza un codigo: quita ceros iniciales y barra final
// Ej: "0306/A" → "306/A"  |  "5350/" → "5350"
function _normalizarCodigo(codigo) {
  if (!codigo) return "";
  return codigo.replace(/^0+/, "").replace(/\/$/, "").trim();
}

// Devuelve la URL de imagen para un código, o null si no hay
function getImagenURL(codigo, categoria) {
  if (!codigo) return null;
  var localImages = (typeof LOCAL_PRODUCT_IMAGES !== "undefined") ? LOCAL_PRODUCT_IMAGES : {};
  var normalizado = _normalizarCodigo(codigo);
  var url = localImages[codigo]
         || localImages[normalizado]
         || PRODUCT_IMAGES[codigo]
         || PRODUCT_IMAGES[normalizado];
  return url || null;
}
