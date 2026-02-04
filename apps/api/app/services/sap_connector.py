from typing import List, Dict


class SapConnector:
    def fetch_open_orders(self) -> List[Dict]:
        raise NotImplementedError

    def fetch_material_blocks(self) -> List[Dict]:
        raise NotImplementedError


class MockSapConnector(SapConnector):
    def fetch_open_orders(self) -> List[Dict]:
        return [{"ot": "OT-1001", "estado": "En proceso"}]

    def fetch_material_blocks(self) -> List[Dict]:
        return [{"material": "Resina", "status": "Bloqueado"}]
