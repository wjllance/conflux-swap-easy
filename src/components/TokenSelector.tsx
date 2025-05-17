
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Token, CONFLUX_TOKENS } from "@/constants/tokens";
import { useState } from "react";

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  otherSelectedToken?: Token | null;
}

export function TokenSelector({
  selectedToken,
  onSelectToken,
  otherSelectedToken,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tokens based on search and exclude the other selected token
  const filteredTokens = CONFLUX_TOKENS.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!otherSelectedToken || token.address !== otherSelectedToken.address)
  );

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-12 px-3 justify-between font-normal"
        >
          {selectedToken ? (
            <div className="flex items-center">
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                className="w-6 h-6 mr-2 rounded-full"
              />
              <span>{selectedToken.symbol}</span>
            </div>
          ) : (
            <span>Select token</span>
          )}
          <span className="ml-2 opacity-70">▼</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        
        <div className="p-2">
          <Input
            placeholder="Search token name or paste address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          
          <ScrollArea className="h-[300px] mt-2">
            <div className="space-y-1">
              {filteredTokens.map((token) => (
                <Button
                  key={token.address}
                  variant="ghost"
                  className="w-full justify-start font-normal h-14"
                  onClick={() => handleSelectToken(token)}
                >
                  <div className="flex items-center">
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-8 h-8 mr-3 rounded-full"
                    />
                    <div className="flex flex-col items-start">
                      <span>{token.symbol}</span>
                      <span className="text-sm text-muted-foreground">
                        {token.name}
                      </span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
