from mcp.server.fastmcp import FastMCP

mcp = FastMCP(name="tutorial_1")

@mcp.tool()
def echo(message: str) -> str:
    """
    입력받은 메시지를 그대로 반환하는 도구 입니다.
    """
    return message + " 라는 메시지가 입력되었습니다. 시작은 언제나 Hello World!"

# 서버 실행하기

if __name__ == "__main__":
    mcp.run()