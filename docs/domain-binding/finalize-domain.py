"""拿到 EdgeOne 控制台的 CNAME 目标值后，一条命令把域名收尾。

用法:
    python domain-binding/finalize-domain.py <CNAME目标值> [TXT主机记录] [TXT值]

做的事:
  1. 把 yhdesign.online 的 @ / www 两条 CNAME 改成控制台给出的精确目标值
  2. 若给了 TXT 验证值，补一条 TXT 记录
  3. 读回全部记录并打印，供核对

前置: 本机 ~/.tccli 凭据有效（腾讯云API专家已配置）。
"""
import json
import subprocess
import sys

BRIDGE = r'C:/Users/ASUS/WorkBuddy/2026-11-14-18-20-05/.workbuddy/tmp/tcrun.py'
DOMAIN = 'yhdesign.online'
DOMAIN_ID = '100282505'


def call(*args):
    proc = subprocess.run(
        [sys.executable, BRIDGE, 'dnspod', *args],
        capture_output=True, text=True, encoding='utf-8', errors='replace',
    )
    raw = proc.stdout.strip()
    if not raw:
        raise RuntimeError(f'{args[0]} 失败: {proc.stderr.strip()[:300]}')
    return json.loads(raw)


def main():
    if len(sys.argv) < 2:
        print('用法: python finalize-domain.py <CNAME目标值> [TXT主机记录] [TXT值]')
        return 1
    target = sys.argv[1].rstrip('.')
    txt_name = sys.argv[2] if len(sys.argv) > 3 else None
    txt_value = sys.argv[3] if len(sys.argv) > 3 else None

    current = call('DescribeRecordList', '--Domain', DOMAIN)
    cnames = [r for r in current['RecordList'] if r['Type'] == 'CNAME' and r['Name'] in ('@', 'www')]

    for r in cnames:
        call(
            'ModifyRecord', '--Domain', DOMAIN, '--DomainId', DOMAIN_ID,
            '--RecordId', str(r['RecordId']),
            '--SubDomain', r['Name'], '--RecordType', 'CNAME',
            '--RecordLine', '默认', '--Value', target, '--TTL', '600',
        )
        print(f'已更新 {r["Name"]:>3} CNAME (RecordId {r["RecordId"]}) -> {target}')

    if txt_name and txt_value:
        call(
            'CreateRecord', '--Domain', DOMAIN, '--DomainId', DOMAIN_ID,
            '--SubDomain', txt_name, '--RecordType', 'TXT',
            '--RecordLine', '默认', '--Value', txt_value, '--TTL', '600',
        )
        print(f'已添加 TXT 验证记录 {txt_name}')

    final = call('DescribeRecordList', '--Domain', DOMAIN)
    print('\n最终解析记录:')
    for r in final['RecordList']:
        print(f'  {r["RecordId"]}  {r["Name"]:>3}  {r["Type"]:<5} -> {r["Value"]}  {r["Status"]}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
