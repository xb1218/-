// 集成ca证书
// 非对称算法
let ALGID_AUTO = 0							  //使用证书时自动适配

// 证书类型定义
let ENCRYPT_TYPE = 1					    //加密证书
let SIGN_TYPE = 2							    //签名证书

// 证书基本项
let X509_CERT_SERIAL =	2					//证书序列号

// 管理员key类型配置
let ks_provider = ""              //介质
let ks_alg = ALGID_AUTO           //非对称算法，根据证书内容适配
let ks_path = "C:\\CONT\\?"       //如果为软算法，对应路径
let ks_hash_alg = ALGID_AUTO      //自动适配算法，RSA时为SHA1, SM2时为SM3

// 发送请求
const request = async (data) => {
  const response = await fetch("http://localhost:9002/WebServerPrinter/Client/signPostData.do", {
    method: "POST",
    body: JSON.stringify(data || {}),
    "Content-Type": "application/json",
  })
  return response.json()
}

// 设置算法提供者KS_SetProv
const KS_SetProvs = async (str_prov, lalg, str_path) => {
	let interface_type = "2"
  let body = {
    "interface_type": interface_type, 
    "str_prov": str_prov, 
    "lalg": Number(lalg), 
    "str_path": str_path
  }
  let res = await request(body)
	return res.error_code
}

// 读取公钥证书KS_GetCert
const KS_GetCerts = async (str_type) => {
	let interface_type = "9"
  let body = {
    "interface_type": interface_type,
    "str_type":Number(str_type)
  }
  let res = await request(body)
	return res.str_base64cert
}

// 解析证书KS_GetCertInfo
const KS_GetCertInfos = async (str_cert, str_type) => {
	let interface_type = "10"
  let body = {
    "interface_type": interface_type,
    "str_cert": str_cert,
    "str_type": Number(str_type)
  }
  let res = await request(body)
	return res.str_info
}

// 设置参数 KS_SetParam
const KS_SetParams = async (str_paramname, str_path) => {
	let interface_type = "3"
  let body = {
    "interface_type": interface_type, 
    "str_paramname": str_paramname, 
    "str_path": str_path
  }
  let res = await request(body)
	return res.error_code
}

// 获得签章图片KS_GetImage
const KS_GetImages = async (str_shebao, str_o) => {
	let interface_type = "27"
  let body = {
    "interface_type": interface_type, 
    "str_shebao": str_shebao, 
    "str_o": str_o
  }
  let res = await request(body)
	return res.str_signimage
}

// 摘要数据KS_HashData
const KS_HashDatas = async (str_indata, str_alg) => {
	let interface_type = "13"
	let body = {
    "interface_type": interface_type,
    "str_indata": str_indata,
    "str_alg": Number(str_alg)
  }
  let res = await request(body)
  return res.str_hashdata
}

// 签名数据KS_SignData
const KS_SignDatas = async (str_indata,str_hashalg) => {
	let interface_type="15"
	let body = {
    "interface_type": interface_type,
    "str_indata": str_indata,
    "str_hashalg": Number(str_hashalg)
  }
  let res = await request(body)
  return res.str_signdata
}

// YL003创建时间戳 KS_TSACreate
const KS_TSACreates = async (str_type, str_Data) => {
	var interface_type = "YL003"
  let body = {
    "interface_type": interface_type,
    "str_type": Number(str_type),
    "str_Data": str_Data
  }
  let res = await request(body)
  return res.str_TSAData
}

/**
 * 设置参数
 * paramname：参数名称
 * paramdata：参数数据
 * return：成功=true，失败=false
 */
const SetParam = async (paramname, paramdata) => {
  let result
  result = await KS_SetParams(paramname, paramdata)
  return result
}

/**
 * 初始化函数，设置相关初始值
 * p_provider: 算法提供者
 * p_alg: 非对称算法，1-RSA1024, 2-RSA2048, 3-ECC
 * p_path: 路径
 */
//设置算法提供者
const init = async (p_provider, p_alg, p_path) => {
  let result = ""
  if(p_provider != null && p_provider != "") {
    ks_provider = p_provider
  }
  if(p_alg != null && p_alg != "") {
    ks_alg = p_alg
  }
  if(p_path != null && p_path != "") {
    ks_path = p_path
  }
  result = await KS_SetProvs(ks_provider, ks_alg, ks_path)
  return result
}

/**
 * 获取BASE64编码证书
 * type: 1、加密证书，2、签名证书
 */
const GetCert = async (type) => {
  let result = ""
  result = await KS_GetCerts(type)
  return result
}

/**
 * 获取证书信息
 * cert: Base64编码证书
 * item: 解析项。
 * 1、证书版本；2、证书序列号；3、证书签名算法标识；4、证书颁发者国家(C); 5、证书颁发者组织名(O);
 * 6、证书颁发者部门名(OU); 7、证书颁发者所在的省、自治区、直辖市(S); 8、证书颁发者通用名称(CN); 9、证书颁发者所在的城市、地区(L);
 * 10、证书颁发者Email; 11、证书有效期：起始日期; 12、证书有效期：终止日期; 13、证书拥有者国家(C ); 14、证书拥有者组织名(O);
 * 15、证书拥有者部门名(OU); 16、证书拥有者所在的省、自治区、直辖市(S); 17、证书拥有者通用名称(CN); 18、证书拥有者所在的城市、地区(L);
 * 19、证书拥有者Email; 20、证书颁发者DN; 21、证书拥有者DN; 22、证书公钥信息; 23、CRL发布点.
 */
//解析证书
const GetCertInfo = async (cert, item) => {
  let result = ""
  result = await KS_GetCertInfos(cert, item)
  return result
}

const setDefaultKeyByTable = async (certSN) => {
	let lRet = await SetParam("defaultkey", certSN)
	lRet = await SetParam("preselectkey", "defaultkey")
}

const GetImage = async () => {
  let result = "";
  result = await KS_GetImages("{\"UseType\":1}", "")
  return result 
}

const HashData = async (indata, hashAlg) => {
  let result = ""
  result = await KS_HashDatas(indata, hashAlg)
  return result
}

const TSACreate = async (str_type, str_Data) => {
  let result = ""
  result = await KS_TSACreates(str_type, str_Data)
  return result
}

/**
 * 数据签名P7
 * indata：明文数据
 * hashAlg: 1-SHA1, 2-SHA256, 3-SHA512, 4-MD5, 5-MD4, 6-SM3
 * return：签名数据
 */
const SignDataByP7 = async (indata) => {
  let result = "";
  await KS_SetParams("signtype", "pksc7")
  return KS_SignDatas(indata, 0)
}

const _GetImage = async () => {
  // 弹框获取用户证书以便获取自动选key证书序列号
  let flag = await init("XACA", "", "")
	let signCert = await GetCert(SIGN_TYPE)
	// 解析证书序列号
	let info = await GetCertInfo(signCert, X509_CERT_SERIAL)
	// 设置默认key
	setDefaultKeyByTable(info)
	// 获取印章
	let imagePic = await GetImage()
	// 清理默认key设置
	setDefaultKeyByTable("")
  return imagePic
}

const _HashData = async (indata) => {
  init("XACA", "", "")
  let hash = HashData(indata, 1)
  return hash
}

const _P7SignData = async (testdata) => {
	init("XACA", 0, 0)
	let signdata = await SignDataByP7(testdata, ks_hash_alg)
  return signdata
}

const _TSATest = async (indata) => {
	init("XACA", "", "")
	let res = await TSACreate(2, indata)
  return res
}

export {
  _GetImage,
  _HashData,
  _P7SignData,
  _TSATest
}