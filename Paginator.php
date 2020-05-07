<?php

namespace GaylordP\PaginatorBundle;

use Doctrine\ORM\QueryBuilder as DoctrineQueryBuilder;
use Doctrine\ORM\Tools\Pagination\CountWalker;
use Doctrine\ORM\Tools\Pagination\Paginator as DoctrinePaginator;

class Paginator
{
    private const NUM_ITEMS = 10;
    private $queryBuilder;
    private $currentPage;
    private $nbResults;
    private $nbItemsPerPage;
    private $nbTotalResults;
    private $results;

    public function __construct(DoctrineQueryBuilder $queryBuilder, int $numItemsPerPage = self::NUM_ITEMS)
    {
        $reflectionClass = new \ReflectionClass($queryBuilder->getRootEntities()[0]);

        if (false !== $reflectionClass->getConstant('NUM_ITEMS')) {
            $numItemsPerPage = $reflectionClass->getConstant('NUM_ITEMS');
        }

        $this->queryBuilder = $queryBuilder;
        $this->nbItemsPerPage = $numItemsPerPage;
    }

    public function paginate(int $page = 1): self
    {
        $this->currentPage = max(1, $page);
        $firstResult = ($this->currentPage - 1) * $this->nbItemsPerPage;

        $query = $this->queryBuilder
            ->setFirstResult($firstResult)
            ->setMaxResults($this->nbItemsPerPage)
            ->getQuery()
        ;

        if (0 === \count($this->queryBuilder->getDQLPart('join'))) {
            $query->setHint(CountWalker::HINT_DISTINCT, false);
        }

        $paginator = new DoctrinePaginator($query, true);

        $useOutputWalkers = \count($this->queryBuilder->getDQLPart('having') ?: []) > 0;
        $paginator->setUseOutputWalkers($useOutputWalkers);

        $this->results = $paginator->getIterator();
        $this->nbResults = count($this->results);
        $this->nbTotalResults = $paginator->count();

        return $this;
    }

    public function getCurrentPage(): int
    {
        return $this->currentPage;
    }

    public function getNbPages(): int
    {
        return ceil($this->nbTotalResults / $this->nbItemsPerPage);
    }

    public function getNbItemsPerPage(): int
    {
        return $this->nbItemsPerPage;
    }

    public function getNbResults(): int
    {
        return $this->nbResults;
    }

    public function getNbTotalResults(): int
    {
        return $this->nbTotalResults;
    }

    public function hasPreviousPage(): bool
    {
        return $this->currentPage > 1;
    }

    public function getPreviousPage(): int
    {
        return max(1, $this->currentPage - 1);
    }

    public function hasNextPage(): bool
    {
        return $this->currentPage < $this->getNbPages();
    }

    public function getNextPage(): int
    {
        return min($this->getNbPages(), $this->currentPage + 1);
    }

    public function hasToPaginate(): bool
    {
        return $this->nbTotalResults > $this->nbItemsPerPage;
    }

    public function getResults(): \Traversable
    {
        return $this->results;
    }
}
