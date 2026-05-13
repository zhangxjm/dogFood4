import hashlib
import xml.etree.ElementTree as ET
import requests
import random
import string
from datetime import datetime
from django.conf import settings


class WeChatPay:
    def __init__(self):
        self.appid = settings.WECHAT_APPID
        self.mch_id = settings.WECHAT_MCH_ID
        self.key = settings.WECHAT_KEY
        self.notify_url = f"{settings.BASE_URL or 'http://localhost:8000'}/api/orders/wechat-notify/"
    
    def generate_sign(self, params):
        sorted_params = sorted(params.items(), key=lambda x: x[0])
        sign_str = '&'.join([f"{k}={v}" for k, v in sorted_params if v and k != 'sign'])
        sign_str += f'&key={self.key}'
        return hashlib.md5(sign_str.encode('utf-8')).hexdigest().upper()
    
    def dict_to_xml(self, data):
        xml = '<xml>'
        for k, v in data.items():
            xml += f'<{k}><![CDATA[{v}]]></{k}>'
        xml += '</xml>'
        return xml
    
    def xml_to_dict(self, xml_str):
        root = ET.fromstring(xml_str)
        result = {}
        for child in root:
            result[child.tag] = child.text
        return result
    
    def unified_order(self, order_no, body, total_fee, openid=None):
        nonce_str = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        
        params = {
            'appid': self.appid,
            'mch_id': self.mch_id,
            'nonce_str': nonce_str,
            'body': body,
            'out_trade_no': order_no,
            'total_fee': int(total_fee * 100),
            'spbill_create_ip': '127.0.0.1',
            'notify_url': self.notify_url,
            'trade_type': 'JSAPI' if openid else 'NATIVE',
        }
        
        if openid:
            params['openid'] = openid
        
        params['sign'] = self.generate_sign(params)
        xml_data = self.dict_to_xml(params)
        
        try:
            response = requests.post(
                'https://api.mch.weixin.qq.com/pay/unifiedorder',
                data=xml_data.encode('utf-8'),
                headers={'Content-Type': 'application/xml'}
            )
            result = self.xml_to_dict(response.content)
            return result
        except Exception as e:
            return {'return_code': 'FAIL', 'return_msg': str(e)}
    
    def create_jsapi_params(self, prepay_id):
        nonce_str = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        timestamp = str(int(datetime.now().timestamp()))
        
        params = {
            'appId': self.appid,
            'timeStamp': timestamp,
            'nonceStr': nonce_str,
            'package': f'prepay_id={prepay_id}',
            'signType': 'MD5',
        }
        
        params['paySign'] = self.generate_sign(params)
        params['prepay_id'] = prepay_id
        return params
    
    def verify_notify(self, xml_data):
        result = self.xml_to_dict(xml_data)
        
        if result.get('return_code') != 'SUCCESS':
            return False, result
        
        sign = result.pop('sign', None)
        expected_sign = self.generate_sign(result)
        
        if sign != expected_sign:
            return False, result
        
        return True, result


wechat_pay = WeChatPay()
