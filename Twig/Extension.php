<?php

namespace GaylordP\PaginatorBundle\Twig;

use GaylordP\PaginatorBundle\Paginator;
use Twig\Environment;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class Extension extends AbstractExtension
{
    private $twig;

    public function __construct(Environment $twig)
    {
        $this->twig = $twig;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'renderPaginator',
                [$this, 'renderPaginator'],
                ['is_safe' => ['html']]
            ),
        ];
    }

    public function renderPaginator(
        Paginator $paginator,
        string $route,
        array $routeParameters = [],
        array $htmlAttributes = [],
        $title = null
    ): string {
        return $this->twig->render('@Paginator/paginator.html.twig', [
            'paginator' => $paginator,
            'route_name' => $route,
            'route_parameters' => $routeParameters,
            'attr' => $htmlAttributes,
            'title' => $title,
        ]);
    }
}
