from fastapi import APIRouter
from schemas import AutocompleteRequest, AutocompleteResponse
from services.autocomplete_service import AutocompleteService

router = APIRouter()


@router.post("/autocomplete", response_model=AutocompleteResponse)
async def get_autocomplete(request: AutocompleteRequest):
    """
    Mocked AI autocomplete endpoint.
    Returns a simple suggestion based on the code context.
    
    In a real implementation, this would call an ML model or language server.
    """
    autocomplete_service = AutocompleteService()
    suggestion = autocomplete_service.get_suggestion(
        code=request.code,
        cursor_position=request.cursorPosition,
        language=request.language
    )
    
    return AutocompleteResponse(
        suggestion=suggestion["text"],
        confidence=suggestion["confidence"]
    )
