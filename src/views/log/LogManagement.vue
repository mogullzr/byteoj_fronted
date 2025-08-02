<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import { Document, Warning, Loading } from '@element-plus/icons-vue';
import {SearchControllerService} from "../../../generated";
import {ElMessage} from "element-plus";

// Comprehensive Chinese provinces and cities data
const regionOptions = [
  {
    label: '江西省',
    value: '江西省',
    children: [
      { label: '南昌市', value: '南昌市' },
      { label: '景德镇市', value: '景德镇市' },
      { label: '萍乡市', value: '萍乡市' },
      { label: '九江市', value: '九江市' },
      { label: '新余市', value: '新余市' },
      { label: '鹰潭市', value: '鹰潭市' },
      { label: '赣州市', value: '赣州市' },
      { label: '吉安市', value: '吉安市' },
      { label: '宜春市', value: '宜春市' },
      { label: '抚州市', value: '抚州市' },
      { label: '上饶市', value: '上饶市' }
    ]
  },
  {
    label: '北京市',
    value: '北京市',
    children: [
      { label: '东城区', value: '东城区' },
      { label: '西城区', value: '西城区' },
      { label: '朝阳区', value: '朝阳区' },
      { label: '丰台区', value: '丰台区' },
      { label: '石景山区', value: '石景山区' },
      { label: '海淀区', value: '海淀区' },
      { label: '门头沟区', value: '门头沟区' },
      { label: '房山区', value: '房山区' },
      { label: '通州区', value: '通州区' },
      { label: '顺义区', value: '顺义区' },
      { label: '昌平区', value: '昌平区' },
      { label: '大兴区', value: '大兴区' },
      { label: '怀柔区', value: '怀柔区' },
      { label: '平谷区', value: '平谷区' },
      { label: '密云区', value: '密云区' },
      { label: '延庆区', value: '延庆区' }
    ]
  },
  {
    label: '天津市',
    value: '天津市',
    children: [
      { label: '和平区', value: '和平区' },
      { label: '河东区', value: '河东区' },
      { label: '河西区', value: '河西区' },
      { label: '南开区', value: '南开区' },
      { label: '河北区', value: '河北区' },
      { label: '红桥区', value: '红桥区' },
      { label: '东丽区', value: '东丽区' },
      { label: '西青区', value: '西青区' },
      { label: '津南区', value: '津南区' },
      { label: '北辰区', value: '北辰区' },
      { label: '武清区', value: '武清区' },
      { label: '宝坻区', value: '宝坻区' },
      { label: '滨海新区', value: '滨海新区' },
      { label: '宁河区', value: '宁河区' },
      { label: '静海区', value: '静海区' },
      { label: '蓟州区', value: '蓟州区' }
    ]
  },
  {
    label: '河北省',
    value: '河北省',
    children: [
      { label: '石家庄市', value: '石家庄市' },
      { label: '唐山市', value: '唐山市' },
      { label: '秦皇岛市', value: '秦皇岛市' },
      { label: '邯郸市', value: '邯郸市' },
      { label: '邢台市', value: '邢台市' },
      { label: '保定市', value: '保定市' },
      { label: '张家口市', value: '张家口市' },
      { label: '承德市', value: '承德市' },
      { label: '沧州市', value: '沧州市' },
      { label: '廊坊市', value: '廊坊市' },
      { label: '衡水市', value: '衡水市' }
    ]
  },
  {
    label: '山西省',
    value: '山西省',
    children: [
      { label: '太原市', value: '太原市' },
      { label: '大同市', value: '大同市' },
      { label: '阳泉市', value: '阳泉市' },
      { label: '长治市', value: '长治市' },
      { label: '晋城市', value: '晋城市' },
      { label: '朔州市', value: '朔州市' },
      { label: '晋中市', value: '晋中市' },
      { label: '运城市', value: '运城市' },
      { label: '忻州市', value: '忻州市' },
      { label: '临汾市', value: '临汾市' },
      { label: '吕梁市', value: '吕梁市' }
    ]
  },
  {
    label: '内蒙古自治区',
    value: '内蒙古自治区',
    children: [
      { label: '呼和浩特市', value: '呼和浩特市' },
      { label: '包头市', value: '包头市' },
      { label: '乌海市', value: '乌海市' },
      { label: '赤峰市', value: '赤峰市' },
      { label: '通辽市', value: '通辽市' },
      { label: '鄂尔多斯市', value: '鄂尔多斯市' },
      { label: '呼伦贝尔市', value: '呼伦贝尔市' },
      { label: '巴彦淖尔市', value: '巴彦淖尔市' },
      { label: '乌兰察布市', value: '乌兰察布市' },
      { label: '兴安盟', value: '兴安盟' },
      { label: '锡林郭勒盟', value: '锡林郭勒盟' },
      { label: '阿拉善盟', value: '阿拉善盟' }
    ]
  },
  {
    label: '辽宁省',
    value: '辽宁省',
    children: [
      { label: '沈阳市', value: '沈阳市' },
      { label: '大连市', value: '大连市' },
      { label: '鞍山市', value: '鞍山市' },
      { label: '抚顺市', value: '抚顺市' },
      { label: '本溪市', value: '本溪市' },
      { label: '丹东市', value: '丹东市' },
      { label: '锦州市', value: '锦州市' },
      { label: '营口市', value: '营口市' },
      { label: '阜新市', value: '阜新市' },
      { label: '辽阳市', value: '辽阳市' },
      { label: '盘锦市', value: '盘锦市' },
      { label: '铁岭市', value: '铁岭市' },
      { label: '朝阳市', value: '朝阳市' },
      { label: '葫芦岛市', value: '葫芦岛市' }
    ]
  },
  {
    label: '吉林省',
    value: '吉林省',
    children: [
      { label: '长春市', value: '长春市' },
      { label: '吉林市', value: '吉林市' },
      { label: '四平市', value: '四平市' },
      { label: '辽源市', value: '辽源市' },
      { label: '通化市', value: '通化市' },
      { label: '白山市', value: '白山市' },
      { label: '松原市', value: '松原市' },
      { label: '白城市', value: '白城市' },
      { label: '延边朝鲜族自治州', value: '延边朝鲜族自治州' }
    ]
  },
  {
    label: '黑龙江省',
    value: '黑龙江省',
    children: [
      { label: '哈尔滨市', value: '哈尔滨市' },
      { label: '齐齐哈尔市', value: '齐齐哈尔市' },
      { label: '鸡西市', value: '鸡西市' },
      { label: '鹤岗市', value: '鹤岗市' },
      { label: '双鸭山市', value: '双鸭山市' },
      { label: '大庆市', value: '大庆市' },
      { label: '伊春市', value: '伊春市' },
      { label: '佳木斯市', value: '佳木斯市' },
      { label: '七台河市', value: '七台河市' },
      { label: '牡丹江市', value: '牡丹江市' },
      { label: '黑河市', value: '黑河市' },
      { label: '绥化市', value: '绥化市' },
      { label: '大兴安岭地区', value: '大兴安岭地区' }
    ]
  },
  {
    label: '上海市',
    value: '上海市',
    children: [
      { label: '黄浦区', value: '黄浦区' },
      { label: '徐汇区', value: '徐汇区' },
      { label: '长宁区', value: '长宁区' },
      { label: '静安区', value: '静安区' },
      { label: '普陀区', value: '普陀区' },
      { label: '虹口区', value: '虹口区' },
      { label: '杨浦区', value: '杨浦区' },
      { label: '闵行区', value: '闵行区' },
      { label: '宝山区', value: '宝山区' },
      { label: '嘉定区', value: '嘉定区' },
      { label: '浦东新区', value: '浦东新区' },
      { label: '金山区', value: '金山区' },
      { label: '松江区', value: '松江区' },
      { label: '青浦区', value: '青浦区' },
      { label: '奉贤区', value: '奉贤区' },
      { label: '崇明区', value: '崇明区' }
    ]
  },
  {
    label: '江苏省',
    value: '江苏省',
    children: [
      { label: '南京市', value: '南京市' },
      { label: '无锡市', value: '无锡市' },
      { label: '徐州市', value: '徐州市' },
      { label: '常州市', value: '常州市' },
      { label: '苏州市', value: '苏州市' },
      { label: '南通市', value: '南通市' },
      { label: '连云港市', value: '连云港市' },
      { label: '淮安市', value: '淮安市' },
      { label: '盐城市', value: '盐城市' },
      { label: '扬州市', value: '扬州市' },
      { label: '镇江市', value: '镇江市' },
      { label: '泰州市', value: '泰州市' },
      { label: '宿迁市', value: '宿迁市' }
    ]
  },
  {
    label: '浙江省',
    value: '浙江省',
    children: [
      { label: '杭州市', value: '杭州市' },
      { label: '宁波市', value: '宁波市' },
      { label: '温州市', value: '温州市' },
      { label: '嘉兴市', value: '嘉兴市' },
      { label: '湖州市', value: '湖州市' },
      { label: '绍兴市', value: '绍兴市' },
      { label: '金华市', value: '金华市' },
      { label: '衢州市', value: '衢州市' },
      { label: '舟山市', value: '舟山市' },
      { label: '台州市', value: '台州市' },
      { label: '丽水市', value: '丽水市' }
    ]
  },
  {
    label: '安徽省',
    value: '安徽省',
    children: [
      { label: '合肥市', value: '合肥市' },
      { label: '芜湖市', value: '芜湖市' },
      { label: '蚌埠市', value: '蚌埠市' },
      { label: '淮南市', value: '淮南市' },
      { label: '马鞍山市', value: '马鞍山市' },
      { label: '淮北市', value: '淮北市' },
      { label: '铜陵市', value: '铜陵市' },
      { label: '安庆市', value: '安庆市' },
      { label: '黄山市', value: '黄山市' },
      { label: '滁州市', value: '滁州市' },
      { label: '阜阳市', value: '阜阳市' },
      { label: '宿州市', value: '宿州市' },
      { label: '六安市', value: '六安市' },
      { label: '亳州市', value: '亳州市' },
      { label: '池州市', value: '池州市' },
      { label: '宣城市', value: '宣城市' }
    ]
  },
  {
    label: '福建省',
    value: '福建省',
    children: [
      { label: '福州市', value: '福州市' },
      { label: '厦门市', value: '厦门市' },
      { label: '莆田市', value: '莆田市' },
      { label: '三明市', value: '三明市' },
      { label: '泉州市', value: '泉州市' },
      { label: '漳州市', value: '漳州市' },
      { label: '南平市', value: '南平市' },
      { label: '龙岩市', value: '龙岩市' },
      { label: '宁德市', value: '宁德市' }
    ]
  },
  {
    label: '山东省',
    value: '山东省',
    children: [
      { label: '济南市', value: '济南市' },
      { label: '青岛市', value: '青岛市' },
      { label: '淄博市', value: '淄博市' },
      { label: '枣庄市', value: '枣庄市' },
      { label: '东营市', value: '东营市' },
      { label: '烟台市', value: '烟台市' },
      { label: '潍坊市', value: '潍坊市' },
      { label: '济宁市', value: '济宁市' },
      { label: '泰安市', value: '泰安市' },
      { label: '威海市', value: '威海市' },
      { label: '日照市', value: '日照市' },
      { label: '临沂市', value: '临沂市' },
      { label: '德州市', value: '德州市' },
      { label: '聊城市', value: '聊城市' },
      { label: '滨州市', value: '滨州市' },
      { label: '菏泽市', value: '菏泽市' }
    ]
  },
  {
    label: '河南省',
    value: '河南省',
    children: [
      { label: '郑州市', value: '郑州市' },
      { label: '开封市', value: '开封市' },
      { label: '洛阳市', value: '洛阳市' },
      { label: '平顶山市', value: '平顶山市' },
      { label: '安阳市', value: '安阳市' },
      { label: '鹤壁市', value: '鹤壁市' },
      { label: '新乡市', value: '新乡市' },
      { label: '焦作市', value: '焦作市' },
      { label: '濮阳市', value: '濮阳市' },
      { label: '许昌市', value: '许昌市' },
      { label: '漯河市', value: '漯河市' },
      { label: '三门峡市', value: '三门峡市' },
      { label: '南阳市', value: '南阳市' },
      { label: '商丘市', value: '商丘市' },
      { label: '信阳市', value: '信阳市' },
      { label: '周口市', value: '周口市' },
      { label: '驻马店市', value: '驻马店市' },
      { label: '济源市', value: '济源市' }
    ]
  },
  {
    label: '湖北省',
    value: '湖北省',
    children: [
      { label: '武汉市', value: '武汉市' },
      { label: '黄石市', value: '黄石市' },
      { label: '十堰市', value: '十堰市' },
      { label: '宜昌市', value: '宜昌市' },
      { label: '襄阳市', value: '襄阳市' },
      { label: '鄂州市', value: '鄂州市' },
      { label: '荆门市', value: '荆门市' },
      { label: '孝感市', value: '孝感市' },
      { label: '荆州市', value: '荆州市' },
      { label: '黄冈市', value: '黄冈市' },
      { label: '咸宁市', value: '咸宁市' },
      { label: '随州市', value: '随州市' },
      { label: '恩施土家族苗族自治州', value: '恩施土家族苗族自治州' },
      { label: '仙桃市', value: '仙桃市' },
      { label: '潜江市', value: '潜江市' },
      { label: '天门市', value: '天门市' },
      { label: '神农架林区', value: '神农架林区' }
    ]
  },
  {
    label: '湖南省',
    value: '湖南省',
    children: [
      { label: '长沙市', value: '长沙市' },
      { label: '株洲市', value: '株洲市' },
      { label: '湘潭市', value: '湘潭市' },
      { label: '衡阳市', value: '衡阳市' },
      { label: '邵阳市', value: '邵阳市' },
      { label: '岳阳市', value: '岳阳市' },
      { label: '常德市', value: '常德市' },
      { label: '张家界市', value: '张家界市' },
      { label: '益阳市', value: '益阳市' },
      { label: '郴州市', value: '郴州市' },
      { label: '永州市', value: '永州市' },
      { label: '怀化市', value: '怀化市' },
      { label: '娄底市', value: '娄底市' },
      { label: '湘西土家族苗族自治州', value: '湘西土家族苗族自治州' }
    ]
  },
  {
    label: '广东省',
    value: '广东省',
    children: [
      { label: '广州市', value: '广州市' },
      { label: '韶关市', value: '韶关市' },
      { label: '深圳市', value: '深圳市' },
      { label: '珠海市', value: '珠海市' },
      { label: '汕头市', value: '汕头市' },
      { label: '佛山市', value: '佛山市' },
      { label: '江门市', value: '江门市' },
      { label: '湛江市', value: '湛江市' },
      { label: '茂名市', value: '茂名市' },
      { label: '肇庆市', value: '肇庆市' },
      { label: '惠州市', value: '惠州市' },
      { label: '梅州市', value: '梅州市' },
      { label: '汕尾市', value: '汕尾市' },
      { label: '河源市', value: '河源市' },
      { label: '阳江市', value: '阳江市' },
      { label: '清远市', value: '清远市' },
      { label: '东莞市', value: '东莞市' },
      { label: '中山市', value: '中山市' },
      { label: '潮州市', value: '潮州市' },
      { label: '揭阳市', value: '揭阳市' },
      { label: '云浮市', value: '云浮市' }
    ]
  },
  {
    label: '广西壮族自治区',
    value: '广西壮族自治区',
    children: [
      { label: '南宁市', value: '南宁市' },
      { label: '柳州市', value: '柳州市' },
      { label: '桂林市', value: '桂林市' },
      { label: '梧州市', value: '梧州市' },
      { label: '北海市', value: '北海市' },
      { label: '防城港市', value: '防城港市' },
      { label: '钦州市', value: '钦州市' },
      { label: '贵港市', value: '贵港市' },
      { label: '玉林市', value: '玉林市' },
      { label: '百色市', value: '百色市' },
      { label: '贺州市', value: '贺州市' },
      { label: '河池市', value: '河池市' },
      { label: '来宾市', value: '来宾市' },
      { label: '崇左市', value: '崇左市' }
    ]
  },
  {
    label: '海南省',
    value: '海南省',
    children: [
      { label: '海口市', value: '海口市' },
      { label: '三亚市', value: '三亚市' },
      { label: '三沙市', value: '三沙市' },
      { label: '儋州市', value: '儋州市' },
      { label: '五指山市', value: '五指山市' },
      { label: '琼海市', value: '琼海市' },
      { label: '文昌市', value: '文昌市' },
      { label: '万宁市', value: '万宁市' },
      { label: '东方市', value: '东方市' },
      { label: '定安县', value: '定安县' },
      { label: '屯昌县', value: '屯昌县' },
      { label: '澄迈县', value: '澄迈县' },
      { label: '临高县', value: '临高县' },
      { label: '白沙黎族自治县', value: '白沙黎族自治县' },
      { label: '昌江黎族自治县', value: '昌江黎族自治县' },
      { label: '乐东黎族自治县', value: '乐东黎族自治县' },
      { label: '陵水黎族自治县', value: '陵水黎族自治县' },
      { label: '保亭黎族苗族自治县', value: '保亭黎族苗族自治县' },
      { label: '琼中黎族苗族自治县', value: '琼中黎族苗族自治县' }
    ]
  },
  {
    label: '重庆市',
    value: '重庆市',
    children: [
      { label: '渝中区', value: '渝中区' },
      { label: '大渡口区', value: '大渡口区' },
      { label: '江北区', value: '江北区' },
      { label: '沙坪坝区', value: '沙坪坝区' },
      { label: '九龙坡区', value: '九龙坡区' },
      { label: '南岸区', value: '南岸区' },
      { label: '北碚区', value: '北碚区' },
      { label: '綦江区', value: '綦江区' },
      { label: '大足区', value: '大足区' },
      { label: '渝北区', value: '渝北区' },
      { label: '巴南区', value: '巴南区' },
      { label: '黔江区', value: '黔江区' },
      { label: '长寿区', value: '长寿区' },
      { label: '江津区', value: '江津区' },
      { label: '合川区', value: '合川区' },
      { label: '永川区', value: '永川区' },
      { label: '南川区', value: '南川区' },
      { label: '璧山区', value: '璧山区' },
      { label: '铜梁区', value: '铜梁区' },
      { label: '潼南区', value: '潼南区' },
      { label: '荣昌区', value: '荣昌区' },
      { label: '开州区', value: '开州区' },
      { label: '梁平区', value: '梁平区' },
      { label: '武隆区', value: '武隆区' },
      { label: '城口县', value: '城口县' },
      { label: '丰都县', value: '丰都县' },
      { label: '垫江县', value: '垫江县' },
      { label: '忠县', value: '忠县' },
      { label: '云阳县', value: '云阳县' },
      { label: '奉节县', value: '奉节县' },
      { label: '巫山县', value: '巫山县' },
      { label: '巫溪县', value: '巫溪县' },
      { label: '石柱土家族自治县', value: '石柱土家族自治县' },
      { label: '秀山土家族苗族自治县', value: '秀山土家族苗族自治县' },
      { label: '酉阳土家族苗族自治县', value: '酉阳土家族苗族自治县' },
      { label: '彭水苗族土家族自治县', value: '彭水苗族土家族自治县' }
    ]
  },
  {
    label: '四川省',
    value: '四川省',
    children: [
      { label: '成都市', value: '成都市' },
      { label: '自贡市', value: '自贡市' },
      { label: '攀枝花市', value: '攀枝花市' },
      { label: '泸州市', value: '泸州市' },
      { label: '德阳市', value: '德阳市' },
      { label: '绵阳市', value: '绵阳市' },
      { label: '广元市', value: '广元市' },
      { label: '遂宁市', value: '遂宁市' },
      { label: '内江市', value: '内江市' },
      { label: '乐山市', value: '乐山市' },
      { label: '南充市', value: '南充市' },
      { label: '眉山市', value: '眉山市' },
      { label: '宜宾市', value: '宜宾市' },
      { label: '广安市', value: '广安市' },
      { label: '达州市', value: '达州市' },
      { label: '雅安市', value: '雅安市' },
      { label: '巴中市', value: '巴中市' },
      { label: '资阳市', value: '资阳市' },
      { label: '阿坝藏族羌族自治州', value: '阿坝藏族羌族自治州' },
      { label: '甘孜藏族自治州', value: '甘孜藏族自治州' },
      { label: '凉山彝族自治州', value: '凉山彝族自治州' }
    ]
  },
  {
    label: '贵州省',
    value: '贵州省',
    children: [
      { label: '贵阳市', value: '贵阳市' },
      { label: '六盘水市', value: '六盘水市' },
      { label: '遵义市', value: '遵义市' },
      { label: '安顺市', value: '安顺市' },
      { label: '毕节市', value: '毕节市' },
      { label: '铜仁市', value: '铜仁市' },
      { label: '黔西南布依族苗族自治州', value: '黔西南布依族苗族自治州' },
      { label: '黔东南苗族侗族自治州', value: '黔东南苗族侗族自治州' },
      { label: '黔南布依族苗族自治州', value: '黔南布依族苗族自治州' }
    ]
  },
  {
    label: '云南省',
    value: '云南省',
    children: [
      { label: '昆明市', value: '昆明市' },
      { label: '曲靖市', value: '曲靖市' },
      { label: '玉溪市', value: '玉溪市' },
      { label: '保山市', value: '保山市' },
      { label: '昭通市', value: '昭通市' },
      { label: '丽江市', value: '丽江市' },
      { label: '普洱市', value: '普洱市' },
      { label: '临沧市', value: '临沧市' },
      { label: '楚雄彝族自治州', value: '楚雄彝族自治州' },
      { label: '红河哈尼族彝族自治州', value: '红河哈尼族彝族自治州' },
      { label: '文山壮族苗族自治州', value: '文山壮族苗族自治州' },
      { label: '西双版纳傣族自治州', value: '西双版纳傣族自治州' },
      { label: '大理白族自治州', value: '大理白族自治州' },
      { label: '德宏傣族景颇族自治州', value: '德宏傣族景颇族自治州' },
      { label: '怒江傈僳族自治州', value: '怒江傈僳族自治州' },
      { label: '迪庆藏族自治州', value: '迪庆藏族自治州' }
    ]
  },
  {
    label: '西藏自治区',
    value: '西藏自治区',
    children: [
      { label: '拉萨市', value: '拉萨市' },
      { label: '日喀则市', value: '日喀则市' },
      { label: '昌都市', value: '昌都市' },
      { label: '林芝市', value: '林芝市' },
      { label: '山南市', value: '山南市' },
      { label: '那曲市', value: '那曲市' },
      { label: '阿里地区', value: '阿里地区' }
    ]
  },
  {
    label: '陕西省',
    value: '陕西省',
    children: [
      { label: '西安市', value: '西安市' },
      { label: '铜川市', value: '铜川市' },
      { label: '宝鸡市', value: '宝鸡市' },
      { label: '咸阳市', value: '咸阳市' },
      { label: '渭南市', value: '渭南市' },
      { label: '延安市', value: '延安市' },
      { label: '汉中市', value: '汉中市' },
      { label: '榆林市', value: '榆林市' },
      { label: '安康市', value: '安康市' },
      { label: '商洛市', value: '商洛市' }
    ]
  },
  {
    label: '甘肃省',
    value: '甘肃省',
    children: [
      { label: '兰州市', value: '兰州市' },
      { label: '嘉峪关市', value: '嘉峪关市' },
      { label: '金昌市', value: '金昌市' },
      { label: '白银市', value: '白银市' },
      { label: '天水市', value: '天水市' },
      { label: '武威市', value: '武威市' },
      { label: '张掖市', value: '张掖市' },
      { label: '平凉市', value: '平凉市' },
      { label: '酒泉市', value: '酒泉市' },
      { label: '庆阳市', value: '庆阳市' },
      { label: '定西市', value: '定西市' },
      { label: '陇南市', value: '陇南市' },
      { label: '临夏回族自治州', value: '临夏回族自治州' },
      { label: '甘南藏族自治州', value: '甘南藏族自治州' }
    ]
  },
  {
    label: '青海省',
    value: '青海省',
    children: [
      { label: '西宁市', value: '西宁市' },
      { label: '海东市', value: '海东市' },
      { label: '海北藏族自治州', value: '海北藏族自治州' },
      { label: '黄南藏族自治州', value: '黄南藏族自治州' },
      { label: '海南藏族自治州', value: '海南藏族自治州' },
      { label: '果洛藏族自治州', value: '果洛藏族自治州' },
      { label: '玉树藏族自治州', value: '玉树藏族自治州' },
      { label: '海西蒙古族藏族自治州', value: '海西蒙古族藏族自治州' }
    ]
  },
  {
    label: '宁夏回族自治区',
    value: '宁夏回族自治区',
    children: [
      { label: '银川市', value: '银川市' },
      { label: '石嘴山市', value: '石嘴山市' },
      { label: '吴忠市', value: '吴忠市' },
      { label: '固原市', value: '固原市' },
      { label: '中卫市', value: '中卫市' }
    ]
  },
  {
    label: '新疆维吾尔自治区',
    value: '新疆维吾尔自治区',
    children: [
      { label: '乌鲁木齐市', value: '乌鲁木齐市' },
      { label: '克拉玛依市', value: '克拉玛依市' },
      { label: '吐鲁番市', value: '吐鲁番市' },
      { label: '哈密市', value: '哈密市' },
      { label: '昌吉回族自治州', value: '昌吉回族自治州' },
      { label: '博尔塔拉蒙古自治州', value: '博尔塔拉蒙古自治州' },
      { label: '巴音郭楞蒙古自治州', value: '巴音郭楞蒙古自治州' },
      { label: '阿克苏地区', value: '阿克苏地区' },
      { label: '克孜勒苏柯尔克孜自治州', value: '克孜勒苏柯尔克孜自治州' },
      { label: '喀什地区', value: '喀什地区' },
      { label: '和田地区', value: '和田地区' },
      { label: '伊犁哈萨克自治州', value: '伊犁哈萨克自治州' },
      { label: '塔城地区', value: '塔城地区' },
      { label: '阿勒泰地区', value: '阿勒泰地区' },
      { label: '石河子市', value: '石河子市' },
      { label: '阿拉尔市', value: '阿拉尔市' },
      { label: '图木舒克市', value: '图木舒克市' },
      { label: '五家渠市', value: '五家渠市' },
      { label: '北屯市', value: '北屯市' },
      { label: '铁门关市', value: '铁门关市' },
      { label: '双河市', value: '双河市' },
      { label: '可克达拉市', value: '可克达拉市' },
      { label: '昆玉市', value: '昆玉市' },
      { label: '胡杨河市', value: '胡杨河市' }
    ]
  },
  {
    label: '台湾省',
    value: '台湾省',
    children: [
      { label: '台北市', value: '台北市' },
      { label: '新北市', value: '新北市' },
      { label: '桃园市', value: '桃园市' },
      { label: '台中市', value: '台中市' },
      { label: '台南市', value: '台南市' },
      { label: '高雄市', value: '高雄市' },
      { label: '基隆市', value: '基隆市' },
      { label: '新竹市', value: '新竹市' },
      { label: '嘉义市', value: '嘉义市' },
      { label: '新竹县', value: '新竹县' },
      { label: '宜兰县', value: '宜兰县' },
      { label: '苗栗县', value: '苗栗县' },
      { label: '彰化县', value: '彰化县' },
      { label: '南投县', value: '南投县' },
      { label: '云林县', value: '云林县' },
      { label: '嘉义县', value: '嘉义县' },
      { label: '屏东县', value: '屏东县' },
      { label: '台东县', value: '台东县' },
      { label: '花莲县', value: '花莲县' },
      { label: '澎湖县', value: '澎湖县' },
      { label: '金门县', value: '金门县' },
      { label: '连江县', value: '连江县' }
    ]
  },
  {
    label: '香港特别行政区',
    value: '香港特别行政区',
    children: [
      { label: '香港岛', value: '香港岛' },
      { label: '九龙', value: '九龙' },
      { label: '新界', value: '新界' }
    ]
  },
  {
    label: '澳门特别行政区',
    value: '澳门特别行政区',
    children: [
      { label: '澳门半岛', value: '澳门半岛' },
      { label: '氹仔', value: '氹仔' },
      { label: '路环', value: '路环' }
    ]
  }
];

// Add region selection state
const selectedRegion = ref<string[]>([]);

// Loading state
const isLoading = ref(false);

// Original data structure
const statisticsData = reactive({
  dailyUsers: 0,
  weeklyUsers: 0,
  monthlyUsers: 0,
  totalLogs: 0,
  operationLogs: 0,
  exceptionLogs: 0
});

const activeTab = ref('operation');
const operationLogs = ref([]);
const exceptionLogs = ref([]);

// Original pagination
const operationPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const exceptionPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// Original search parameters
const dateRange = ref([]);
const searchUsername = ref('');
const searchKeyword = ref('');
const searchModule = ref('');
const searchStatusCode = ref('');
const searchMethod = ref('');

// Module options
const moduleOptions = [
  '用户模块', '聚合搜索模块', '题目模块', '帖子模块',
  'AI模块', '课程模块', '竞赛模块', '聊天室模块',
  'RSA模块', '日志模块'
];

// Status code options
const statusCodeOptions = [
  { value: '0', label: '成功' },
  { value: '40000', label: '请求参数错误' },
  { value: '40100', label: '未登录' },
  { value: '40101', label: '无权限' },
  { value: '40400', label: '请求数据不存在' },
  { value: '40300', label: '禁止访问' },
  { value: '50000', label: '系统错误' },
  { value: '50001', label: '操作失败' }
];

// Request method options
const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

// Watch for changes in selectedRegion and searchKeyword to enforce mutual exclusivity
watch([selectedRegion, searchKeyword], ([newRegion, newKeyword]) => {
  if (newRegion.length > 0 && newKeyword) {
    searchKeyword.value = '';
    ElMessage.warning('地区选择和日志关键词不能同时使用');
  }
});

// Date formatting
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
};

// Fetch logs
const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const searchRequest = {
      category: "log",
      code: searchStatusCode.value ? [searchStatusCode.value] : [],
      current: activeTab.value === 'operation' ? operationPagination.currentPage - 1 : exceptionPagination.currentPage - 1,
      difficulty: searchUsername.value,
      is_date_order: 0,
      keyword: selectedRegion.value.length > 0 ? selectedRegion.value.join('') : searchKeyword.value,
      module: searchModule.value,
      pageNum: activeTab.value === 'operation' ? operationPagination.currentPage : exceptionPagination.currentPage,
      pageSize: activeTab.value === 'operation' ? operationPagination.pageSize : exceptionPagination.pageSize,
      pages: 0,
      size: 0,
      sourceList: [],
      status: activeTab.value === 'operation' ? 1 : 2,
      tagsList: [],
      type: searchMethod.value ? [searchMethod.value] : [],
      startMilliSeconds: dateRange.value && dateRange.value[0] ? Math.floor(new Date(dateRange.value[0]).getTime() / 1000) : '',
      endMilliSeconds: dateRange.value && dateRange.value[1] ? Math.floor(new Date(dateRange.value[1] + ' 23:59:59').getTime() / 1000) : ''
    };

    const res = await SearchControllerService.searchAllUsingPost(searchRequest);
    if (res.code === 0 && res.data && res.data.dataList) {
      const processLog = (log) => ({
        log_id: log.log_id,
        username: log.username,
        operation: log.description,
        ip: log.ip,
        status: log.code === 0 ? '200' : log.code,
        time: formatDate(log.create_time),
        module: log.module,
        url: log.url,
        type: log.type,
        operation_time: log.operation_time,
        params: log.params,
        error: log.error
      });

      if (activeTab.value === 'operation') {
        operationLogs.value = res.data.dataList.map(processLog);
        operationPagination.total = res.data.dataList[0]?.total || 0;
        statisticsData.operationLogs = res.data.dataList[0]?.total || 0;
      } else {
        exceptionLogs.value = res.data.dataList.map(processLog);
        exceptionPagination.total = res.data.dataList[0]?.total || 0;
        statisticsData.exceptionLogs = res.data.dataList[0]?.total || 0;
      }
      statisticsData.totalLogs = (statisticsData.operationLogs + statisticsData.exceptionLogs) || 0;
    }
  } catch (error) {
    console.error('加载日志失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// Search handler
const handleSearch = () => {
  if (activeTab.value === 'operation') {
    operationPagination.currentPage = 1;
  } else {
    exceptionPagination.currentPage = 1;
  }
  fetchLogs();
};

// Reset search
const handleReset = () => {
  searchKeyword.value = '';
  searchModule.value = '';
  searchStatusCode.value = '';
  searchMethod.value = '';
  searchUsername.value = '';
  dateRange.value = [];
  selectedRegion.value = [];
  handleSearch();
};

// Page change handler
const handlePageChange = () => {
  fetchLogs();
};

// Tab change handler
const handleTabChange = () => {
  handleSearch();
};

onMounted(() => {
  fetchLogs();
});
</script>

<template>
  <div class="log-management">
    <div class="page-header">
      <h1>日志管理系统</h1>
    </div>

    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="8">
        <el-card>
          <div class="statistic-item">
            <div class="statistic-icon blue">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="statistic-info">
              <div class="statistic-title">今日访问用户</div>
              <div class="statistic-value">{{ statisticsData.dailyUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="statistic-item">
            <div class="statistic-icon green">
              <el-icon><Document /></el-icon>
            </div>
            <div class="statistic-info">
              <div class="statistic-title">操作日志数</div>
              <div class="statistic-value">{{ statisticsData.operationLogs }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="statistic-item">
            <div class="statistic-icon red">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="statistic-info">
              <div class="statistic-title">异常日志数</div>
              <div class="statistic-value">{{ statisticsData.exceptionLogs }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="操作日志" name="operation">
          <div class="log-search-bar">
            <el-form :inline="true" class="search-form">
              <el-form-item label="日志关键词" style="width: 220px">
                <el-input
                    v-model="searchKeyword"
                    placeholder="可匹配详细信息"
                    clearable
                    @keyup.enter="handleSearch"
                    :disabled="selectedRegion.length > 0"
                />
              </el-form-item>
              <el-form-item label="地区" style="width: 220px">
                <el-cascader
                    v-model="selectedRegion"
                    :options="regionOptions"
                    placeholder="选择省市"
                    clearable
                    style="width: 100%"
                    :props="{ expandTrigger: 'hover', checkStrictly: true }"
                    :disabled="searchKeyword != ''"
                />
              </el-form-item>
              <el-form-item label="用户名">
                <el-input
                    v-model="searchUsername"
                    placeholder="可搜索用户名"
                    clearable
                    @keyup.enter="handleSearch"
                />
              </el-form-item>
              <el-form-item label="模块" style="width: 200px;">
                <el-select
                    v-model="searchModule"
                    placeholder="选择模块"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in moduleOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="状态码" style="width: 200px;">
                <el-select
                    v-model="searchStatusCode"
                    placeholder="选择状态码"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in statusCodeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="请求方法" style="width: 240px;">
                <el-select
                    v-model="searchMethod"
                    placeholder="选择请求方法"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in methodOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="日期范围">
                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="table-container">
            <el-table
                :data="operationLogs"
                border
                stripe
                style="width: 100%; margin-top: 15px;"
                height="calc(100vh - 400px)"
                v-loading="isLoading"
                element-loading-text="数据加载中..."
                element-loading-background="rgba(255, 255, 255, 0.7)"
                element-loading-spinner="el-icon-loading"
            >
              <el-table-column prop="log_id" label="日志ID" width="100" />
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="module" label="模块" width="120" />
              <el-table-column prop="url" label="请求路径" min-width="180" show-overflow-tooltip />
              <el-table-column prop="type" label="请求类型" width="100" />
              <el-table-column prop="ip" label="IP地址信息" width="350" />
              <el-table-column prop="status" label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.status === '200' ? 'success' : 'danger'">
                    {{ scope.row.status === '200' || scope.row.status === '20000' ? '20000' : scope.row.status + '报错' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="操作时间" width="180" />
              <el-table-column prop="operation_time" label="耗时(ms)" width="100" />
              <el-table-column label="操作" width="300">
                <template #default="scope">
                  <el-button type="primary" size="small" text @click="$emit('view-detail', { type: 'operation', id: scope.row.log_id })">详情</el-button>
                  <el-button type="danger" size="small" text>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-pagination
              v-model:current-page="operationPagination.currentPage"
              v-model:page-size="operationPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="operationPagination.total"
              @current-change="handlePageChange"
              @size-change="handlePageChange"
              style="margin-top: 15px; justify-content: flex-end;"
              :disabled="isLoading"
          />
        </el-tab-pane>

        <el-tab-pane label="异常日志" name="exception">
          <div class="log-search-bar">
            <el-form :inline="true" class="search-form">
              <el-form-item label="日志关键词">
                <el-input
                    v-model="searchKeyword"
                    placeholder="可搜索请求参数和报错信息"
                    clearable
                    @keyup.enter="handleSearch"
                    :disabled="selectedRegion.length > 0"
                />
              </el-form-item>
              <el-form-item label="地区" style="width: 220px">
                <el-cascader
                    v-model="selectedRegion"
                    :options="regionOptions"
                    placeholder="选择省市"
                    clearable
                    style="width: 100%"
                    :props="{ expandTrigger: 'hover', checkStrictly: true }"
                    :disabled="searchKeyword != ''"
                />
              </el-form-item>
              <el-form-item label="用户名">
                <el-input
                    v-model="searchUsername"
                    placeholder="可搜索用户名"
                    clearable
                    @keyup.enter="handleSearch"
                />
              </el-form-item>
              <el-form-item label="模块" style="width: 200px;">
                <el-select
                    v-model="searchModule"
                    placeholder="选择模块"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in moduleOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="状态码" style="width: 200px;">
                <el-select
                    v-model="searchStatusCode"
                    placeholder="选择状态码"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in statusCodeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="请求方法" style="width: 240px;">
                <el-select
                    v-model="searchMethod"
                    placeholder="选择请求方法"
                    clearable
                    style="width: 100%"
                >
                  <el-option
                      v-for="item in methodOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="日期范围">
                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="table-container">
            <el-table
                :data="exceptionLogs"
                border
                stripe
                style="width: 100%;"
                height="calc(100vh - 400px)"
                v-loading="isLoading"
                element-loading-text="数据加载中..."
                element-loading-background="rgba(255, 255, 255, 0.7)"
                element-loading-spinner="el-icon-loading"
            >
              <el-table-column prop="log_id" label="日志ID" width="100" />
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="module" label="模块" width="120" />
              <el-table-column prop="url" label="请求路径" min-width="150" show-overflow-tooltip />
              <el-table-column prop="type" label="请求类型" width="100" />
              <el-table-column prop="ip" label="IP地址信息" width="350" />
              <el-table-column prop="status" label="状态码" width="120">
                <template #default="scope">
                  <el-tag type="danger">
                    {{ scope.row.status + "报错" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="发生时间" width="180" />
              <el-table-column label="操作" width="300">
                <template #default="scope">
                  <el-button type="primary" size="small" text @click="$emit('view-detail', { type: 'exception', id: scope.row.log_id })">详情</el-button>
                  <el-button type="danger" size="small" text>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-pagination
              v-model:current-page="exceptionPagination.currentPage"
              v-model:page-size="exceptionPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="exceptionPagination.total"
              @current-change="handlePageChange"
              @size-change="handlePageChange"
              style="margin-top: 15px; justify-content: flex-end;"
              :disabled="isLoading"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.log-management {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 48px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 50%, rgba(255, 255, 255, 0) 100%);
}

h1 {
  margin: 0;
  font-size: 26px;
  font-weight: bold;
  color: #303133;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.statistics-cards {
  margin-bottom: 24px;
}

.el-card {
  transition: all 0.3s ease;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.el-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
}

.statistic-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.statistic-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.statistic-icon:hover {
  transform: scale(1.05);
}

.statistic-icon .el-icon {
  font-size: 28px;
  color: #fff;
}

.blue {
  background: linear-gradient(135deg, #409EFF 0%, #2980b9 100%);
}

.green {
  background: linear-gradient(135deg, #67C23A 0%, #27ae60 100%);
}

.red {
  background: linear-gradient(135deg, #F56C6C 0%, #e74c3c 100%);
}

.statistic-info {
  flex: 1;
}

.statistic-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 6px;
}

.statistic-value {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(90deg, #303133, #606266);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.log-search-bar {
  margin-bottom: 18px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.el-table th {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: bold;
}

.el-table tr {
  transition: all 0.2s ease;
}

.el-table tr:hover {
  background-color: #ecf5ff;
}

.el-pagination {
  margin-top: 20px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.el-tag {
  border-radius: 4px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
  font-weight: bold;
}

.el-button {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.el-button--text {
  padding: 4px 8px;
}

.el-button--text:hover {
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 4px;
}

.table-container {
  position: relative;
  min-height: 200px;
}

.el-pagination.is-disabled {
  opacity: 0.7;
}
</style>